function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function toBuffer(arr: Uint8Array): ArrayBuffer {
	return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

async function getRawKey(hexKey: string): Promise<CryptoKey> {
	const keyBytes = hexToBytes(hexKey);
	return crypto.subtle.importKey('raw', toBuffer(keyBytes), { name: 'AES-GCM' }, false, [
		'encrypt',
		'decrypt'
	]);
}

// Format: "iv_hex:cipher_hex" — same as original app
export async function encrypt(text: string, hexKey: string): Promise<string> {
	const key = await getRawKey(hexKey);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(text);
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toBuffer(iv) }, key, toBuffer(encoded));
	return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(encrypted))}`;
}

export async function decrypt(hexData: string, hexKey: string): Promise<string> {
	// Format: "iv_hex:cipher_hex"
	const colonIdx = hexData.indexOf(':');
	if (colonIdx === -1) return hexData; // unencrypted fallback

	const ivHex = hexData.slice(0, colonIdx);
	const cipherHex = hexData.slice(colonIdx + 1);

	const key = await getRawKey(hexKey);
	const iv = hexToBytes(ivHex);
	const cipher = hexToBytes(cipherHex);

	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toBuffer(iv) }, key, toBuffer(cipher));
	return new TextDecoder().decode(decrypted);
}
