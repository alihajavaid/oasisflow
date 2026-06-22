import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const IMG = "https://oasisflowwater.com/images";

function couponCode() {
  return "OF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function dateOnlyDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function createCouponBookWithCodes(customerId: string, typeId: string, totalCoupons: number, usedCount: number, usedByDriverId?: string) {
  const book = await prisma.couponBook.create({
    data: { customerId, typeId, totalCoupons, remainingCoupons: totalCoupons - usedCount },
  });
  const coupons = [];
  for (let i = 0; i < totalCoupons; i++) {
    coupons.push(
      await prisma.coupon.create({
        data: {
          code: couponCode(),
          couponBookId: book.id,
          status: i < usedCount ? "USED" : "UNUSED",
          usedAt: i < usedCount ? daysAgo(totalCoupons - i) : null,
          usedByDriverId: i < usedCount ? usedByDriverId : null,
        },
      })
    );
  }
  return { book, coupons };
}

async function main() {
  const adminPass = await bcrypt.hash("Admin123!", 10);
  const driverPass = await bcrypt.hash("Driver123!", 10);
  const customerPass = await bcrypt.hash("Customer123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@oasisflowwater.com" },
    update: {},
    create: { name: "OasisFlow Admin", email: "admin@oasisflowwater.com", passwordHash: adminPass, role: "ADMIN" },
  });

  // ---------- Areas ----------
  const areaDefs = [
    { name: "Mussafah", description: "Mussafah industrial & residential zone, Abu Dhabi", lat: 24.3392, lng: 54.5012 },
    { name: "Khalifa City", description: "Khalifa City, Abu Dhabi", lat: 24.4198, lng: 54.6019 },
    { name: "Al Reem Island", description: "Al Reem Island, Abu Dhabi", lat: 24.4992, lng: 54.4046 },
    { name: "Corniche", description: "Corniche Road area, Abu Dhabi", lat: 24.4764, lng: 54.345 },
    { name: "Yas Island", description: "Yas Island, Abu Dhabi", lat: 24.4995, lng: 54.6045 },
    { name: "Saadiyat Island", description: "Saadiyat Island, Abu Dhabi", lat: 24.5468, lng: 54.435 },
  ];
  const areas: Record<string, Awaited<ReturnType<typeof prisma.deliveryArea.upsert>>> = {};
  for (const a of areaDefs) {
    areas[a.name] = await prisma.deliveryArea.upsert({
      where: { name: a.name },
      update: {},
      create: { name: a.name, description: a.description },
    });
  }

  // ---------- Products ----------
  const product = await prisma.product.upsert({
    where: { slug: "5-gallon-bottle" },
    update: {},
    create: {
      name: "5 Gallon Bottle",
      slug: "5-gallon-bottle",
      description: "Pure and refreshing water delivered in convenient 5-gallon bottles.",
      price: 6.99,
      unit: "5 Gallon Bottle",
      imageUrl: `${IMG}/5-gallon.webp`,
      stock: 500,
    },
  });
  await prisma.product.upsert({
    where: { slug: "water-dispenser" },
    update: {},
    create: {
      name: "Water Dispenser",
      slug: "water-dispenser",
      description: "Modern hot & cold water dispenser for home or office, rental and purchase options available.",
      price: 250,
      unit: "Unit",
      imageUrl: `${IMG}/dispenser.webp`,
      stock: 50,
    },
  });

  // ---------- Coupon Book Types ----------
  const bookTypeDefs = [
    { code: "CB-17", name: "Coupon Book CB-17", totalCoupons: 17, price: 97.5, imageUrl: `${IMG}/coupon17.webp`, perks: "Can be redeemed for 5-gallon bottles." },
    { code: "CB-28", name: "Coupon Book CB-28", totalCoupons: 28, price: 160, imageUrl: `${IMG}/coupon2-hero.webp`, perks: "Can be redeemed for 5-gallon bottles." },
    { code: "CB-35", name: "Coupon Book CB-35", totalCoupons: 35, price: 195, imageUrl: `${IMG}/coupon3-hero.webp`, perks: "Can be redeemed for 5-gallon bottles." },
    { code: "CB-75-LIFETIME", name: "Coupon Book CB-75 + Free Dispenser (Lifetime)", totalCoupons: 75, price: 590, imageUrl: `${IMG}/coupon1.webp`, perks: "Includes a free dispenser, yours to keep." },
    { code: "CB-75-RETURNABLE", name: "Coupon Book CB-75 + Free Dispenser (Returnable)", totalCoupons: 75, price: 490, imageUrl: `${IMG}/coupon2.webp`, perks: "Includes a free dispenser, returnable after stopping service." },
  ];
  const bookTypes: Record<string, Awaited<ReturnType<typeof prisma.couponBookType.upsert>>> = {};
  for (const bt of bookTypeDefs) {
    bookTypes[bt.code] = await prisma.couponBookType.upsert({
      where: { code: bt.code },
      update: {},
      create: {
        code: bt.code,
        name: bt.name,
        totalCoupons: bt.totalCoupons,
        price: bt.price,
        pricePerCoupon: Math.round((bt.price / bt.totalCoupons) * 100) / 100,
        perks: bt.perks,
        imageUrl: bt.imageUrl,
      },
    });
  }

  // ---------- Drivers (each can cover multiple areas) ----------
  const driverDefs = [
    { email: "driver1@oasisflowwater.com", name: "Ahmed Khan", phone: "0501234567", areas: ["Mussafah", "Khalifa City"], vehicleInfo: "Pickup Truck - DXB 12345", licenseNo: "AD-998877", baseSalary: 2500 },
    { email: "driver2@oasisflowwater.com", name: "Bilal Hussain", phone: "0502223344", areas: ["Al Reem Island"], vehicleInfo: "Van - AUH 55821", licenseNo: "AD-441122", baseSalary: 2700 },
    { email: "driver3@oasisflowwater.com", name: "Sara Ahmed", phone: "0503334455", areas: ["Corniche", "Yas Island"], vehicleInfo: "Pickup Truck - AUH 77234", licenseNo: "AD-225588", baseSalary: 2600 },
    { email: "driver4@oasisflowwater.com", name: "Omar Farooq", phone: "0504445566", areas: ["Saadiyat Island", "Mussafah"], vehicleInfo: "Van - AUH 90011", licenseNo: "AD-336699", baseSalary: 2800 },
  ];

  const drivers: { user: Awaited<ReturnType<typeof prisma.user.upsert>>; profile: Awaited<ReturnType<typeof prisma.driverProfile.upsert>> }[] = [];
  for (const d of driverDefs) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: { name: d.name, email: d.email, passwordHash: driverPass, role: "DRIVER", phone: d.phone },
    });
    const profile = await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: { areas: { set: d.areas.map((a) => ({ id: areas[a].id })) } },
      create: {
        userId: user.id,
        vehicleInfo: d.vehicleInfo,
        licenseNo: d.licenseNo,
        baseSalary: d.baseSalary,
        areas: { connect: d.areas.map((a) => ({ id: areas[a].id })) },
      },
    });
    drivers.push({ user, profile });
  }
  const [driver1, driver2, driver3, driver4] = drivers;

  // ---------- Customers ----------
  const customerDefs = [
    { email: "customer@example.com", name: "Fatimah Al Mansoori", phone: "0559998877", address: "Villa 12, Street 4, Mussafah, Abu Dhabi", area: "Mussafah", lat: 24.339, lng: 54.5018, book: "CB-17", used: 3 },
    { email: "khalid@example.com", name: "Khalid Al Suwaidi", phone: "0551112233", address: "Building 8, Khalifa City A, Abu Dhabi", area: "Khalifa City", lat: 24.4205, lng: 54.6031, book: "CB-35", used: 10 },
    { email: "mariam@example.com", name: "Mariam Yousef", phone: "0552223344", address: "Marina Heights Tower, Al Reem Island, Abu Dhabi", area: "Al Reem Island", lat: 24.4985, lng: 54.4061, book: "CB-75-LIFETIME", used: 22 },
    { email: "hassan@example.com", name: "Hassan Raza", phone: "0553334455", address: "Corniche Road, Abu Dhabi", area: "Corniche", lat: 24.4771, lng: 54.3438, book: null, used: 0 },
    { email: "layla@example.com", name: "Layla Ibrahim", phone: "0554445566", address: "Yas Acres, Yas Island, Abu Dhabi", area: "Yas Island", lat: 24.5002, lng: 54.6062, book: "CB-28", used: 5 },
    { email: "yusuf@example.com", name: "Yusuf Al Ketbi", phone: "0555556677", address: "Saadiyat Beach Villas, Saadiyat Island, Abu Dhabi", area: "Saadiyat Island", lat: 24.5459, lng: 54.4339, book: "CB-75-RETURNABLE", used: 8 },
  ];

  const customers: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};
  for (const c of customerDefs) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash: customerPass,
        role: "CUSTOMER",
        phone: c.phone,
        address: c.address,
        lat: c.lat,
        lng: c.lng,
      },
    });
    customers[c.email] = user;

    if (c.book) {
      const existing = await prisma.couponBook.count({ where: { customerId: user.id } });
      if (existing === 0) {
        const type = bookTypes[c.book];
        await createCouponBookWithCodes(user.id, type.id, type.totalCoupons, c.used, driver1.user.id);
      }
    }
  }

  // ---------- Delivery requests, routes & stops with demo states ----------
  const existingRequests = await prisma.deliveryRequest.count();
  if (existingRequests === 0) {
    type Scenario = {
      driver: typeof driver1;
      area: string;
      customerEmail: string;
      lat: number;
      lng: number;
      bottlesQty: number;
      useCoupon: boolean;
      routeDay: number; // days ago
      routeStatus: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
      stopStatus: "DELIVERED" | "OUT_FOR_DELIVERY" | "SCHEDULED";
    };

    const scenarios: Scenario[] = [
      // Driver 1 — yesterday completed route (Mussafah + Khalifa City)
      { driver: driver1, area: "Mussafah", customerEmail: "customer@example.com", lat: 24.341, lng: 54.503, bottlesQty: 2, useCoupon: true, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      { driver: driver1, area: "Khalifa City", customerEmail: "khalid@example.com", lat: 24.4215, lng: 54.604, bottlesQty: 1, useCoupon: true, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      // Driver 1 — today's in-progress route
      { driver: driver1, area: "Mussafah", customerEmail: "customer@example.com", lat: 24.3375, lng: 54.4995, bottlesQty: 1, useCoupon: true, routeDay: 0, routeStatus: "IN_PROGRESS", stopStatus: "DELIVERED" },
      { driver: driver1, area: "Khalifa City", customerEmail: "khalid@example.com", lat: 24.4188, lng: 54.6005, bottlesQty: 2, useCoupon: true, routeDay: 0, routeStatus: "IN_PROGRESS", stopStatus: "OUT_FOR_DELIVERY" },
      { driver: driver1, area: "Mussafah", customerEmail: "customer@example.com", lat: 24.336, lng: 54.498, bottlesQty: 1, useCoupon: false, routeDay: 0, routeStatus: "IN_PROGRESS", stopStatus: "SCHEDULED" },

      // Driver 2 — yesterday completed (Al Reem Island)
      { driver: driver2, area: "Al Reem Island", customerEmail: "mariam@example.com", lat: 24.4975, lng: 54.4055, bottlesQty: 3, useCoupon: true, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      // Driver 2 — today planned route
      { driver: driver2, area: "Al Reem Island", customerEmail: "mariam@example.com", lat: 24.5005, lng: 54.403, bottlesQty: 2, useCoupon: true, routeDay: 0, routeStatus: "PLANNED", stopStatus: "SCHEDULED" },

      // Driver 3 — yesterday completed (Corniche + Yas Island)
      { driver: driver3, area: "Corniche", customerEmail: "hassan@example.com", lat: 24.4758, lng: 54.3461, bottlesQty: 2, useCoupon: false, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      { driver: driver3, area: "Yas Island", customerEmail: "layla@example.com", lat: 24.4988, lng: 54.6078, bottlesQty: 1, useCoupon: true, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      // Driver 3 — today in-progress route spanning both its areas
      { driver: driver3, area: "Corniche", customerEmail: "hassan@example.com", lat: 24.4779, lng: 54.342, bottlesQty: 1, useCoupon: false, routeDay: 0, routeStatus: "IN_PROGRESS", stopStatus: "OUT_FOR_DELIVERY" },
      { driver: driver3, area: "Yas Island", customerEmail: "layla@example.com", lat: 24.5018, lng: 54.602, bottlesQty: 2, useCoupon: true, routeDay: 0, routeStatus: "IN_PROGRESS", stopStatus: "SCHEDULED" },

      // Driver 4 — yesterday completed (Saadiyat Island + Mussafah)
      { driver: driver4, area: "Saadiyat Island", customerEmail: "yusuf@example.com", lat: 24.5475, lng: 54.4362, bottlesQty: 1, useCoupon: true, routeDay: 1, routeStatus: "COMPLETED", stopStatus: "DELIVERED" },
      // Driver 4 — today planned route
      { driver: driver4, area: "Saadiyat Island", customerEmail: "yusuf@example.com", lat: 24.545, lng: 54.4318, bottlesQty: 2, useCoupon: true, routeDay: 0, routeStatus: "PLANNED", stopStatus: "SCHEDULED" },
      { driver: driver4, area: "Mussafah", customerEmail: "customer@example.com", lat: 24.3405, lng: 54.5035, bottlesQty: 1, useCoupon: false, routeDay: 0, routeStatus: "PLANNED", stopStatus: "SCHEDULED" },
    ];

    // group scenarios into one route per driver+day+status combination
    const routeKey = (s: Scenario) => `${s.driver.user.id}|${s.routeDay}|${s.routeStatus}`;
    const grouped = new Map<string, Scenario[]>();
    for (const s of scenarios) {
      const key = routeKey(s);
      grouped.set(key, [...(grouped.get(key) ?? []), s]);
    }

    for (const [, group] of grouped) {
      const first = group[0];
      const route = await prisma.route.create({
        data: {
          driverId: first.driver.user.id,
          date: dateOnlyDaysAgo(first.routeDay),
          status: first.routeStatus,
          startLat: 24.3672,
          startLng: 54.5036,
        },
      });

      let sequence = 1;
      for (const s of group) {
        const customer = customers[s.customerEmail];
        const isDelivered = s.stopStatus === "DELIVERED";
        const isStarted = s.stopStatus !== "SCHEDULED";

        let couponBookId: string | null = null;
        let orderId: string | null = null;

        if (s.useCoupon) {
          const book = await prisma.couponBook.findFirst({ where: { customerId: customer.id } });
          couponBookId = book?.id ?? null;
          if (isDelivered && book) {
            const unusedCoupon = await prisma.coupon.findFirst({ where: { couponBookId: book.id, status: "UNUSED" } });
            if (unusedCoupon) {
              await prisma.coupon.update({
                where: { id: unusedCoupon.id },
                data: { status: "USED", usedAt: daysAgo(s.routeDay), usedByDriverId: s.driver.user.id },
              });
              await prisma.couponBook.update({ where: { id: book.id }, data: { remainingCoupons: { decrement: 1 } } });
            }
          }
        } else {
          const order = await prisma.order.create({
            data: {
              customerId: customer.id,
              totalAmount: product.price * s.bottlesQty,
              deliveryAddress: customer.address ?? "Abu Dhabi",
              lat: s.lat,
              lng: s.lng,
              status: isDelivered ? "DELIVERED" : "CONFIRMED",
              paymentStatus: isDelivered ? "PAID" : "UNPAID",
              items: { create: [{ productId: product.id, quantity: s.bottlesQty, price: product.price }] },
            },
          });
          orderId = order.id;
        }

        const dr = await prisma.deliveryRequest.create({
          data: {
            customerId: customer.id,
            orderId,
            couponBookId,
            areaId: areas[s.area].id,
            bottlesQty: s.bottlesQty,
            emptiesToPick: s.bottlesQty,
            address: customer.address ?? "Abu Dhabi",
            lat: s.lat,
            lng: s.lng,
            status: s.stopStatus === "DELIVERED" ? "DELIVERED" : s.stopStatus === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : "SCHEDULED",
            requestedDate: daysAgo(s.routeDay),
          },
        });

        await prisma.stop.create({
          data: {
            routeId: route.id,
            deliveryRequestId: dr.id,
            sequence: sequence++,
            status: s.stopStatus,
            startedAt: isStarted ? daysAgo(s.routeDay) : null,
            deliveredAt: isDelivered ? daysAgo(s.routeDay) : null,
            cashReceived: isDelivered && !s.useCoupon,
            cashAmount: isDelivered && !s.useCoupon ? product.price * s.bottlesQty : null,
          },
        });
      }

      const totalKm = 5 + Math.random() * 15;
      await prisma.route.update({ where: { id: route.id }, data: { totalDistanceKm: Math.round(totalKm * 10) / 10 } });
    }

    // a few unassigned pending requests for admin dispatch demo
    const pendingDefs = [
      { email: "hassan@example.com", area: "Corniche", lat: 24.4742, lng: 54.3469, qty: 1 },
      { email: "layla@example.com", area: "Yas Island", lat: 24.4972, lng: 54.6028, qty: 1 },
      { email: "mariam@example.com", area: "Al Reem Island", lat: 24.5012, lng: 54.4078, qty: 2 },
    ];
    for (const p of pendingDefs) {
      const customer = customers[p.email];
      await prisma.deliveryRequest.create({
        data: {
          customerId: customer.id,
          areaId: areas[p.area].id,
          bottlesQty: p.qty,
          emptiesToPick: p.qty,
          address: customer.address ?? "Abu Dhabi",
          lat: p.lat,
          lng: p.lng,
          status: "REQUESTED",
        },
      });
    }
  }

  // ---------- Attendance (last 10 days per driver) ----------
  for (const { profile } of drivers) {
    for (let i = 1; i <= 10; i++) {
      const date = dateOnlyDaysAgo(i);
      const roll = Math.random();
      const status = roll < 0.85 ? "PRESENT" : roll < 0.95 ? "ABSENT" : "LEAVE";
      await prisma.attendance.upsert({
        where: { driverId_date: { driverId: profile.id, date } },
        update: {},
        create: { driverId: profile.id, date, status },
      });
    }
  }

  // ---------- Payroll (last month paid, this month pending) ----------
  const now = new Date();
  const thisPeriod = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastPeriod = lastMonthDate.toISOString().slice(0, 7);

  for (const { profile } of drivers) {
    await prisma.payrollRecord.create({
      data: {
        driverId: profile.id,
        period: lastPeriod,
        baseSalary: profile.baseSalary,
        bonus: 100,
        deductions: 0,
        totalPaid: profile.baseSalary + 100,
        status: "PAID",
        paidAt: daysAgo(20),
      },
    });
    await prisma.payrollRecord.create({
      data: {
        driverId: profile.id,
        period: thisPeriod,
        baseSalary: profile.baseSalary,
        bonus: 0,
        deductions: 0,
        totalPaid: profile.baseSalary,
        status: "PENDING",
      },
    });
  }

  // ---------- Feedback & contact inbox ----------
  await prisma.feedback.createMany({
    data: [
      { customerId: customers["customer@example.com"].id, message: "Driver was very polite and on time!", rating: 5 },
      { customerId: customers["khalid@example.com"].id, message: "Water tastes great, coupon system is super convenient.", rating: 5 },
      { customerId: customers["hassan@example.com"].id, message: "Delivery was a bit late this week.", rating: 3 },
    ],
  });
  await prisma.contactMessage.createMany({
    data: [
      { name: "Noura Saeed", email: "noura@example.com", phone: "0556667788", message: "Do you deliver to Masdar City?" },
      { name: "Faisal Ahmed", email: "faisal@example.com", phone: "0557778899", message: "Interested in a dispenser rental for our office." },
    ],
  });

  // ---------- Content blocks ----------
  const content: Record<string, string> = {
    hero_title: "Pure Water Delivered To Your Doorstep",
    hero_subtitle: "Experience the convenience of premium water delivery service with OasisFlow. Stay hydrated with our pure, refreshing water.",
    hero_image: `${IMG}/hero-bottles.webp`,
    why_choose_intro: "We provide premium water delivery services that prioritize purity, convenience and customer satisfaction. Pure and Fresh Till the Last Drop!",
    about_text: "OasisFlow is a modern bottled water delivery platform designed to bring pure, premium 5-gallon water bottles right to your doorstep, quickly, easily, and affordably. For the last 20 years, the company has helped thousands of families drink real mineral water and continues its successful journey with our satisfied customers.",
    contact_address: "Oasisflow, M38, Mussafah, Abu Dhabi, UAE",
    contact_phone: "02 584 6870 / 05 66 66 07 55",
    contact_whatsapp: "971566660755",
    contact_email: "info@oasisflowwater.com",
  };
  for (const [key, value] of Object.entries(content)) {
    await prisma.contentBlock.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // ---------- Inventory ----------
  await prisma.inventoryItem.upsert({
    where: { sku: "BOTTLE-5GAL" },
    update: {},
    create: { name: "5 Gallon Bottle (Filled)", sku: "BOTTLE-5GAL", quantity: 1200, unit: "bottle", reorderLevel: 200, costPerUnit: 3.2 },
  });
  await prisma.inventoryItem.upsert({
    where: { sku: "DISPENSER" },
    update: {},
    create: { name: "Water Dispenser Unit", sku: "DISPENSER", quantity: 40, unit: "unit", reorderLevel: 10, costPerUnit: 180 },
  });

  // ---------- Expenses ----------
  await prisma.expense.createMany({
    data: [
      { category: "Fuel", description: "Diesel for delivery fleet", amount: 850, date: daysAgo(5) },
      { category: "Salaries", description: "Driver payroll - last month", amount: 10600, date: daysAgo(20) },
      { category: "Supplies", description: "New 5-gallon bottle caps", amount: 320, date: daysAgo(8) },
      { category: "Maintenance", description: "Vehicle service - AUH 55821", amount: 540, date: daysAgo(12) },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@oasisflowwater.com / Admin123!");
  console.log("Driver logins: driver1..driver4@oasisflowwater.com / Driver123!");
  console.log("Customer logins: customer@example.com, khalid@, mariam@, hassan@, layla@, yusuf@example.com / Customer123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
