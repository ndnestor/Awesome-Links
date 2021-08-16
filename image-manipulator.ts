// Module imports
const Jimp = require('jimp');

// Script imports
import { methods as logger } from './global-logger';

export class imageManipulator {

    // Overlay text on an image at the specified relative position
    //? Perhaps add an offset parameter
    public static appendText(imagePath: string, fontPath: string, outPath: string, text: string): Promise<void> {
        logger.debug('Appending text to an image');
        return new Promise((resolve, reject) => {

            // Read the image from file
            Jimp.read(imagePath).then((srcImage) => {

                // Read the font from file
                Jimp.loadFont(fontPath).then((font) => {

                    // Get canvas dimensions
                    const canvasWidth = 2 * Jimp.measureText(font, text) + srcImage.bitmap.width;

                    const textHeight = Jimp.measureTextHeight(font, text);
                    const canvasHeight = srcImage.bitmap.height;
                    if(textHeight > canvasHeight) {
                        logger.error('Text height should not be greater than canvas height when appending text');
                        reject();
                    }

                    // Create the image canvas
                    new Jimp(canvasWidth, canvasHeight, '#00000000', (error, canvas) => {
                        if(error !== null) {
                            logger.error(`Could not create image canvas when appending text due to error\n${error}`);
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
                logger.error(`Could not read the image at path ${imagePath} when appending text\n${error}`);
                reject();
            });
        });
    }
}
