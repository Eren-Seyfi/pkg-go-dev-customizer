import sharp from "sharp";
import fs from "fs";

const sizes = [16, 48, 128];
const inputImage = "logo.png"; // Orijinal görselin yolu
const outputDir = "src/assets/icons";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach((size) => {
  sharp(inputImage)
    .resize(size, size)
    .toFile(`${outputDir}/icon${size}.png`)
    .then(() => console.log(`✅ icon${size}.png oluşturuldu.`))
    .catch((err) => console.error(err));
});
