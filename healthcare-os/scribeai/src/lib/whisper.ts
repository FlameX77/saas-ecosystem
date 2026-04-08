import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const LANGUAGE_MAP: Record<string, string> = {
  en: 'english',
  hi: 'hindi',
  ar: 'arabic',
  ur: 'urdu',
}

export async function transcribeAudio(file: File, language: string): Promise<string> {
  const whisperLanguage = LANGUAGE_MAP[language] || 'english'

  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: whisperLanguage === 'urdu' ? 'ur' : language,
  })

  return transcription.text
}
