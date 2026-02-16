import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const db = await getDb();

    // Fetch all collections
    const [orders, menuItems, categories, settings, users] = await Promise.all([
      db.collection("orders").find({}).toArray(),
      db.collection("menuItems").find({}).toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("settings").find({}).toArray(),
      db.collection("users").find({}).toArray(),
    ]);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert orders to worksheet
    const ordersData = orders.map((order: any) => ({
      "Order ID": order.orderId,
      "Customer Name": order.customer?.name || "",
      "Customer Phone": order.customer?.phone || "",
      "Customer Table": order.customer?.tableNumber || "",
      "Items": order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(", ") || "",
      "Total Amount": order.totalAmount,
      "Payment Method": order.paymentMethod,
      "Status": order.orderStatus,
      "Created At": order.createdAt,
      "Updated At": order.updatedAt,
    }));
    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

    // Convert menu items to worksheet
    const menuItemsData = menuItems.map((item: any) => ({
      "Name": item.name,
      "Name (Japanese)": item.nameJa || "",
      "Description": item.description || "",
      "Price": item.price,
      "Category": item.category,
      "Available": item.available ? "Yes" : "No",
      "Image URL": item.imageUrl || "",
      "Created At": item.createdAt || "",
    }));
    const menuItemsSheet = XLSX.utils.json_to_sheet(menuItemsData);
    XLSX.utils.book_append_sheet(workbook, menuItemsSheet, "Menu Items");

    // Convert categories to worksheet
    const categoriesData = categories.map((cat: any) => ({
      "Name": cat.name,
      "Name (Japanese)": cat.nameJa || "",
      "Description": cat.description || "",
      "Order": cat.order || 0,
    }));
    const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories");

    // Convert settings to worksheet
    const settingsData = settings.map((setting: any) => ({
      "Restaurant Name": setting.restaurantName || "",
      "Currency": setting.currency?.code || "",
      "Payment Methods": setting.paymentMethods?.join(", ") || "",
      "Notifications Enabled": setting.notifications?.desktop ? "Yes" : "No",
      "Sound Alerts": setting.notifications?.sound ? "Yes" : "No",
    }));
    const settingsSheet = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(workbook, settingsSheet, "Settings");

    // Convert users to worksheet (excluding passwords)
    const usersData = users.map((user: any) => ({
      "Email": user.email,
      "Name": user.name || "",
      "Role": user.role,
      "Created At": user.createdAt || "",
    }));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return as downloadable file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="qwen_restaurant_export_${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return NextResponse.json(
      { error: "Failed to export database to Excel" },
      { status: 500 }
    );
  }
}
