import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

type Role = 'USER' | 'LAWYER';

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'LAWYER';
}

interface SignupResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const { name, email, password, role } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as Role,
    },
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey',
    { expiresIn: '24h' }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { email, password } = payload;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey',
    { expiresIn: '24h' }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  };
}
