import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { extname, join, resolve } from 'path';

// Use a safe default inside the project folder if IMAGE_PATH is not provided
const DEFAULT_IMAGE_SUBPATH = join('var', 'www', 'public', 'image');
const IMAGE_PATH = resolve(process.env.IMAGE_PATH || join(process.cwd(), DEFAULT_IMAGE_SUBPATH));
const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL || 'http://localhost:8080/';

@Injectable()
export class ImageService {
	ensureImagePath() {
		if (!fs.existsSync(IMAGE_PATH)) {
			try {
				fs.mkdirSync(IMAGE_PATH, { recursive: true });
			} catch (err) {
				// If creation fails, throw to make caller aware
				throw err;
			}
		}
	}

	// Accepts a data URL (base64) like `data:image/png;base64,...` and saves it.
	// Returns the stored filename (not full URL).
	async saveBase64(dataUrl: string): Promise<string> {
		this.ensureImagePath();
		const matches = /^data:(image\/[a-zA-Z0-9+.]+);base64,(.+)$/.exec(dataUrl);
		if (!matches) {
			throw new Error('Invalid data URL');
		}
		const mime = matches[1];
		const b64 = matches[2];
		const ext = mime.split('/')[1] || 'png';
		const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
		const buffer = Buffer.from(b64, 'base64');
		const filePath = join(IMAGE_PATH, filename);
		try {
			await fs.promises.writeFile(filePath, buffer, { flag: 'w' });
		} catch (err) {
			// wrap and rethrow to provide clearer message
			throw new Error(`Failed to save image to ${filePath}: ${err?.message || err}`);
		}
		return filename; // store filename in DB; product_response will resolve URL
	}

	// If given a full URL that points to our BASE_IMAGE_URL, return filename part.
	// If given a local filename, return it unchanged. If external URL, return as-is.
	async normalizeImageReference(input?: string): Promise<string | undefined> {
		if (!input) return undefined;
		input = input.trim();
		if (input === '') return undefined;

		// Already an absolute URL to external host
		if (input.startsWith('http://') || input.startsWith('https://')) {
			// If it's our base image url, extract filename
			if (input.startsWith(BASE_IMAGE_URL)) {
				const suffix = input.substring(BASE_IMAGE_URL.length);
				// suffix could be 'image/filename' or 'image\\filename' or 'image/filename'
				const parts = suffix.split('/');
				const filename = parts[parts.length - 1];
				return filename;
			}
			// External URL - keep as-is
			return input;
		}

		// If it looks like a data URL, save it.
		if (input.startsWith('data:')) {
			const filename = await this.saveBase64(input);
			return filename;
		}

		// If it contains a slash (e.g., 'image/filename'), extract filename
		if (input.includes('/')) {
			const parts = input.split('/');
			return parts[parts.length - 1];
		}

		// Otherwise assume it's already a filename
		return input;
	}

	// Build a public URL for an image stored locally (filename)
	buildPublicUrl(imageRef?: string): string | undefined {
		if (!imageRef) return undefined;
		if (imageRef.startsWith('http')) return imageRef;
		return BASE_IMAGE_URL + 'image/' + imageRef;
	}
}
