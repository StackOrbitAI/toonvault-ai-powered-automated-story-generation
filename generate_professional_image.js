const prompt = "masterpiece, ultra high quality, professional digital art, beautiful manhwa style, a mysterious and elegant woman holding an ancient magical book, cinematic lighting, glowing particles, deep purple and gold theme, 8k resolution, trending on artstation";
const seed = Math.floor(Math.random() * 1000000);
const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

console.log("🚀 Generated a professional promotional image using Pollinations AI:");
console.log(url);
