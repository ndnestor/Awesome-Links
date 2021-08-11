// Module imports
const Jimp = require('jimp');

// Script imports
import { methods as logger } from './global-logger';

export class imageManipulator {

    // Overlay text on an image at the specified relative position
    // TODO: Add offset parameter
    public static appendText(imagePath: string, fontPath: string, outPath: string, text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // TODO: Add logging
            // Read the image from file
            Jimp.read(imagePath).then((srcImage) => {

                // Read the font from file
                Jimp.loadFont(fontPath).then((font) => {

                    // Get canvas dimensions
                    const canvasWidth = 2 * Jimp.measureText(font, text) + srcImage.bitmap.width;

                    const textHeight = Jimp.measureTextHeight(font, text);
                    const canvasHeight = srcImage.bitmap.height;
                    if(textHeight > canvasHeight) {
                        // TODO: Throw error as this may cause problems
                        reject();
                    }

                    // Create the image canvas
                    new Jimp(canvasWidth, canvasHeight, '#00000000', (error, canvas) => {
                        if(error !== null) {
                            // TODO: Throw error
                            reject();
                        }

                        // Add the original image to the canvas
                        const srcImageXPos = canvasWidth / 2 - srcImage.bitmap.width / 2;
                        const srcImageYPos = canvasHeight / 2 - srcImage.bitmap.height / 2;
                        canvas.composite(srcImage, srcImageXPos, srcImageYPos);

                        // Add text to the canvas
                        const textXPos = canvasWidth / 2 + srcImage.bitmap.width / 2;
                        const textYPos = canvasHeight / 2 - textHeight / 2;
                        canvas.print(font, textXPos, textYPos, text);

                        // Write canvas to file
                        canvas.write(outPath, () => {
                            resolve();
                        });
                    });
                });

            }).catch((error) => {
                // TODO: Throw and log error
                console.error(error.toString());
                reject();
            });
        });
    }
}
