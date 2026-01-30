import path from 'path'
import { randomUUIDv7 } from 'bun'

const envPath = path.resolve(process.cwd(), '.env')

const env = await Bun.file(envPath).text()


for (const line of env.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_API_KEY=')) {
        const newApiKey = randomUUIDv7()
        const newEnv = env.replace(/NEXT_PUBLIC_API_KEY='.*'/, `NEXT_PUBLIC_API_KEY='${newApiKey}'`)
        await Bun.write(envPath, newEnv)
        console.log(`Generated new API key: ${newApiKey}`)
        break
    }
}