import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Order } from './order.schema';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GoogleSheetsService {
    private readonly logger = new Logger(GoogleSheetsService.name);
    private sheets;

    constructor() {
        // Initialize Google Sheets API
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your service account JSON file
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
    }

    async appendOrderToSheet(order: Order): Promise<void> {
        try {
            const spreadsheetId = process.env.GOOGLE_SHEET_ID;

            // Format date as "HH:mm:ss DD/MM/YYYY"
            const date = new Date(order.createdAt);
            const pad = (n: number) => String(n).padStart(2, '0');
            const formattedDate = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

            // Format each item as "SKU-[màu]-[size]-sl", skipping empty attributes
            const productsText = order.items.map(item => {
                const attributes = item.variantAttributes || [];
                const sku = item.sku || item.productName;
                // Collect only non-empty attribute values (color before size by convention)
                const attrValues = attributes
                    .map(attr => attr.value)
                    .filter(v => v && v.trim() !== '');
                return [sku, ...attrValues, String(item.quantity)].join('-');
            }).join('\n');

            // Columns: Ngày | Tên | SDT | ĐỊA CHỈ | Sản phẩm | Tổng bill
            const row = [
                formattedDate,       // Ngày
                order.fullName,      // Tên
                order.phoneNumber,   // SDT
                order.address,       // ĐỊA CHỈ
                productsText,        // Sản phẩm (all items, one per line)
                order.totalAmount,   // Tổng bill
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Gia lap trang thanh toan!A:F',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [row],
                },
            });

            this.logger.log(`Order ${order._id} appended to Google Sheet successfully`);
        } catch (error) {
            this.logger.error(`Failed to append order to Google Sheet: ${error.message}`, error.stack);
            // Don't throw error - order should still be saved even if Google Sheets fails
        }
    }
}
