const { PrismaClient } = require("@prisma/client");

const base = "http://localhost:4000";
const prisma = new PrismaClient();
const out = [];

const stamp = Date.now();
const userEmail = `apitest_user_${stamp}@test.com`;
const lawyerEmail = `apitest_lawyer_${stamp}@test.com`;
const pw = "Pass1234!";

async function req(name, path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_err) {}
  out.push({ name, status: res.status, ok: res.ok, body: data });
  if (!res.ok) throw new Error(`${name} failed ${res.status}`);
  return data;
}

async function reqAllowFail(name, path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_err) {}
  out.push({ name, status: res.status, ok: res.ok, body: data });
  return { res, data };
}

async function run() {
  try {
    await req("health", "/health");

    const suUser = await req("signup_user", "/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "API Test User",
        email: userEmail,
        password: pw,
        role: "USER",
      }),
    });

    const suLawyer = await req("signup_lawyer", "/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "API Test Lawyer",
        email: lawyerEmail,
        password: pw,
        role: "LAWYER",
      }),
    });

    const liUser = await req("login_user", "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, password: pw }),
    });
    const liLawyer = await req("login_lawyer", "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: lawyerEmail, password: pw }),
    });

    const ut = `Bearer ${liUser.token}`;
    const lt = `Bearer ${liLawyer.token}`;

    await prisma.lawyer.upsert({
      where: { userId: suLawyer.id },
      update: { city: "Cairo", specialization: "Family Law", availability: true },
      create: { userId: suLawyer.id, city: "Cairo", specialization: "Family Law", availability: true },
    });

    await req("profile_get", "/api/auth/profile", { headers: { Authorization: ut } });
    await req("profile_update", "/api/auth/profile", {
      method: "PUT",
      headers: { Authorization: ut },
      body: JSON.stringify({ name: "API Test User Updated" }),
    });

    const lawyers = await req(
      "lawyers_list",
      "/api/lawyers?city=Cairo&specialization=Family&sortBy=rating&sortOrder=desc&take=5"
    );
    const lawyerId = lawyers.data && lawyers.data[0] ? lawyers.data[0].id : null;
    if (lawyerId) await req("lawyer_by_id", `/api/lawyers/${lawyerId}`);

    const av = await req("availability_add", "/api/availability", {
      method: "POST",
      headers: { Authorization: lt },
      body: JSON.stringify({ date: "2026-02-10", startTime: "10:00", endTime: "11:00" }),
    });
    await req("availability_get", "/api/availability?startDate=2026-02-01&endDate=2026-02-28", {
      headers: { Authorization: lt },
    });

    const booking = await req("booking_create", "/api/bookings", {
      method: "POST",
      headers: { Authorization: ut },
      body: JSON.stringify({ availabilityId: av.id, reason: "Need consultation" }),
    });
    await req("booking_user_list", "/api/bookings", { headers: { Authorization: ut } });
    await req("booking_lawyer_list", "/api/bookings/lawyer", { headers: { Authorization: lt } });
    await req("booking_accept", "/api/bookings/accept", {
      method: "POST",
      headers: { Authorization: lt },
      body: JSON.stringify({ bookingId: booking.id }),
    });

    const av2 = await req("availability_add_2", "/api/availability", {
      method: "POST",
      headers: { Authorization: lt },
      body: JSON.stringify({ date: "2026-02-11", startTime: "12:00", endTime: "13:00" }),
    });
    const booking2 = await req("booking_create_2", "/api/bookings", {
      method: "POST",
      headers: { Authorization: ut },
      body: JSON.stringify({ availabilityId: av2.id }),
    });
    await req("booking_cancel", "/api/bookings/cancel", {
      method: "POST",
      headers: { Authorization: ut },
      body: JSON.stringify({ bookingId: booking2.id }),
    });

    const chat = await req("chat_create", "/api/chats", {
      method: "POST",
      headers: { Authorization: ut },
      body: JSON.stringify({ title: "API Test Chat" }),
    });
    await req("chat_list", "/api/chats", { headers: { Authorization: ut } });
    await req("chat_get", `/api/chats/${chat.id}`, { headers: { Authorization: ut } });
    await req("chat_update_title", `/api/chats/${chat.id}`, {
      method: "PUT",
      headers: { Authorization: ut },
      body: JSON.stringify({ title: "Renamed Chat" }),
    });
    await reqAllowFail("chat_message_ai", "/api/chats/message", {
      method: "POST",
      headers: { Authorization: ut },
      body: JSON.stringify({ chatId: chat.id, message: "Hello, legal advice please" }),
    });
    await req("chat_delete", `/api/chats/${chat.id}`, {
      method: "DELETE",
      headers: { Authorization: ut },
    });

    await req("ranking_list", "/api/ranking/lawyers?city=Cairo&specialization=Family&limit=5");
    if (lawyerId) await req("ranking_lawyer_details", `/api/ranking/lawyers/${lawyerId}`);

    await req("availability_full_day_unavailable", "/api/availability/full-day-unavailable", {
      method: "POST",
      headers: { Authorization: lt },
      body: JSON.stringify({ date: "2026-02-12" }),
    });
    await req("availability_remove", "/api/availability", {
      method: "DELETE",
      headers: { Authorization: lt },
      body: JSON.stringify({ availabilityId: av.id }),
    });
  } catch (e) {
    out.push({ name: "fatal", error: String(e) });
  } finally {
    await prisma.$disconnect();
    console.log(JSON.stringify(out, null, 2));
  }
}

run();
