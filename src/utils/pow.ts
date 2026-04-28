import CryptoJS from 'crypto-js'

const MAX_NONCE = 5_000_000
const BATCH_SIZE = 200_000

function hasLeadingZeroNibblesInWords(words: number[], zeroNibbles: number) {
	for (let nibbleIndex = 0; nibbleIndex < zeroNibbles; nibbleIndex++) {
		const wordIndex = Math.floor(nibbleIndex / 8)
		const nibbleOffset = nibbleIndex % 8
		const shift = 28 - nibbleOffset * 4
		if ((((words[wordIndex] ?? 0) >>> shift) & 0x0f) !== 0) return false
	}
	return true
}

function yieldToMainThread() {
	return new Promise((resolve) => {
		setTimeout(resolve, 0)
	})
}

export async function solvePow(
	hash: string,
	powSalt: string,
	difficulty: number
): Promise<string | null> {
	const normalizedDifficulty = Math.max(0, difficulty)
	const inputPrefix = `${hash}:${powSalt}:`
	if (normalizedDifficulty === 0) return '0'

	await yieldToMainThread()

	for (let nonce = 0; nonce < MAX_NONCE; nonce++) {
		const nonceText = nonce.toString(16)
		if (
			hasLeadingZeroNibblesInWords(
				CryptoJS.SHA256(inputPrefix + nonceText).words,
				normalizedDifficulty
			)
		) {
			return nonceText
		}
		if (nonce > 0 && nonce % BATCH_SIZE === 0) {
			await yieldToMainThread()
		}
	}
	return null
}
