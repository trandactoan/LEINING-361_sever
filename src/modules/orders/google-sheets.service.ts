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
            const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Your Google Sheet ID from the URL

            // Format the order data according to your sheet structure
            // Columns: Ngày | Tên | SĐT | ĐỊA CHỈ | MÀU | SIZE | NOTE | MÀU | Link
            const rows = order.items.map(item => {
                // Get variant attributes
                const attributes = item.variantAttributes || [];
                const sizeAttr = attributes.find(attr => attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'kích thước');
                const colorAttr = attributes.find(attr => attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'màu');

                // Format date as YYYY-MM-DD HH:mm:ss
                const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                return [
                    formattedDate,                          // Ngày
                    order.fullName,                         // Tên
                    order.phoneNumber,                      // SĐT
                    order.address,                          // ĐỊA CHỈ
                    colorAttr?.value || '',                 // MÀU
                    sizeAttr?.value || '',                  // SIZE
                    `${item.productName} x${item.quantity}`, // NOTE
                    item.sku || '',                         // MÀU (SKU or additional info)
                    item.image || ''                        // Link (image URL)
                ];
            });

            // Append rows to the sheet
            await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Gia lap trang thanh toan!A:I', // Updated sheet name
                valueInputOption: 'RAW',
                requestBody: {
                    values: rows,
                },
            });

            this.logger.log(`Order ${order._id} appended to Google Sheet successfully`);
        } catch (error) {
            this.logger.error(`Failed to append order to Google Sheet: ${error.message}`, error.stack);
            // Don't throw error - order should still be saved even if Google Sheets fails
        }
    }
}
