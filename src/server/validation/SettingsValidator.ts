import { DatabaseState } from "@/types/settings";
import { ValidationError } from "../errors/ValidationError";
import { LastRead, Surah } from "@/types/surah";
import { ReciterWishlist } from "@/types/wishlist";
export class SettingsValidator {
  static validate(data: DatabaseState) {
    // Volume validation
    if (typeof data.volume !== "number" || data.volume < 0 || data.volume > 1) {
      throw new ValidationError("Volume must be between 0 and 1");
    }
    // Reciter validation
    if (!Number.isInteger(data.reciterId) || data.reciterId <= 0) {
      throw new ValidationError("Invalid reciter ID");
    }
    // Font size validation
    if (
      !Number.isInteger(data.fontSize) ||
      data.fontSize < 1 ||
      data.fontSize > 10
    ) {
      throw new ValidationError("Font size must be between 1 and 10");
    }
    // Font style validation
    const validFontStyles = ["uthmani", "almushaf", "almajeed"];
    if (!validFontStyles.includes(data.fontStyle)) {
      throw new ValidationError(
        `Font style must be one of: ${validFontStyles.join(", ")}`,
      );
    }
    // Ayah number style validation

    const validAyahStyles = ["ayah-1", "ayah-2", "ayah-3", "ayah-4", "ayah-5"];
    if (!validAyahStyles.includes(data.ayahNumberStyle)) {
      throw new ValidationError(
        `Ayah number style must be one of: ${validAyahStyles.join(", ")}`,
      );
    }

    // Language validation
    const validLanguages = ["ar", "en"];
    if (data.language && !validLanguages.includes(data.language)) {
      throw new ValidationError(`Language must be one of: ${validLanguages.join(", ")}`);
    }

    // Last read validation
    if (data.lastRead) {
      this.validateLastRead(data.lastRead);
    }
    // Athkar data validation
    this.validateAthkarData(data.athkarData);
    // play history validation
    // this.validateWishlist(data.playHistory, "surah");
    // Wishlist validation
    this.validateWishlist(data.wishlistSurahs, "surah");
    this.validateWishlist(data.wishlistReciters, "reciter");
  }
  private static validateAthkarData(data: unknown) {
    if (data === null || data === undefined) return;
    if (typeof data !== "object" || Array.isArray(data)) {
      throw new ValidationError("Athkar data must be a JSON object");
    }
    // Check for prototype pollution
    if (Object.getPrototypeOf(data) !== Object.prototype) {
      throw new ValidationError("Invalid athkar data structure");
    }
  }
  private static validateWishlist(items: unknown, type: "surah" | "reciter") {
    if (items === undefined || items === null) {
      return; // Optional field
    }

    if (!Array.isArray(items)) {
      throw new ValidationError(`Wishlist ${type}s must be an array`);
    }
    // Validate each item
    items.forEach((item, index) => {
      if (type === "surah") {
        this.validateWishlistSurah(item, index);
      } else {
        this.validateWishlistReciter(item, index);
      }
    });
  }

  private static validateWishlistSurah(item: Surah, index: number) {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        `Invalid surah wishlist item at index ${index}`,
      );
    }

    // Required integer fields
    if (!Number.isInteger(item.number) || item.number <= 0) {
      throw new ValidationError(`Invalid surahId at index ${index}`);
    }

    if (!Number.isInteger(item.reciterId) ) {
      throw new ValidationError(`Invalid reciterId at index ${index}`);
    }

    if (!Number.isInteger(item.numberOfAyahs) || item.numberOfAyahs <= 0) {
      throw new ValidationError(`Invalid numberOfAyahs at index ${index}`);
    }

    if  (item.mushafId !== undefined && !Number.isInteger(item.mushafId)) {
      throw new ValidationError(`Invalid mushafId at index ${index}`);
    }


    const requiredStringFields = [
      "name",
      "mushafName",
      "shortName",
      "englishName",
      "englishNameTranslation",
      "revelationType",
      "reciterName",
      "serverLink",
    ] as (keyof Surah)[];

    for (const field of requiredStringFields) {
      if (
        typeof item[field] !== "string" ||
        (item[field] as string).trim() === ""
      ) {
        throw new ValidationError(
          `Invalid or missing ${field} at index ${index}`,
        );
      } 
    }

    // if (
    //   !Number.isInteger(item.reciterId) ||
    //   !item.reciterId ||
    //   item.reciterId <= 0
    // ) {
    //   throw new ValidationError(`Invalid reciterId at index ${index}`);
    // }
    // if (!Number.isInteger(item.numberOfAyahs) || item.numberOfAyahs <= 0) {
    //   throw new ValidationError(`Invalid numberOfAyahs at index ${index}`);
    // }
    // if (item.serverLink && typeof item.serverLink !== "string") {
    //   throw new ValidationError(`Invalid serverLink at index ${index}`);
    // }
    // if (item.reciterName && typeof item.reciterName !== "string") {
    //   throw new ValidationError(`Invalid reciterName at index ${index}`);
    // }
  }

  private static validateWishlistReciter(item: ReciterWishlist, index: number) {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        `Invalid reciter wishlist item at index ${index}`,
      );
    }

    // Required integer fields
    if (!Number.isInteger(item.reciter_id) || item.reciter_id <= 0) {
      throw new ValidationError(`Invalid reciterId at index ${index}`);
    }
    if (
      !Number.isInteger(item.mushaf_id) &&
      typeof item.mushaf_id !== "string"
    ) {
      throw new ValidationError(`Invalid mushafId at index ${index}`);
    }

    // Required string fields
    const requiredStrings = [
      "reciter_name",
      "reciter_image",
      "mushaf_name",
    ] as (keyof ReciterWishlist)[];

    for (const field of requiredStrings) {
      if (
        typeof item[field] !== "string" ||
        (item[field] as string).trim() === ""
      ) {
        throw new ValidationError(
          `Invalid or missing ${field} at index ${index}`,
        );
      }
    }
  }

  private static validateLastRead(item: LastRead) { 
     if (!item || typeof item !== 'object') {
    throw new ValidationError('Invalid LastRead: must be an object');
  }


  // Validate required fields
  if (item.chapter_id === undefined || item.chapter_id === null) {
    throw new ValidationError('Invalid LastRead: missing chapter_id');
  }

  if (typeof item.verse_number !== 'number') {
    throw new ValidationError('Invalid LastRead: verse_number must be a number');
  }

  if (typeof item.verse_key !== 'string') {
    throw new ValidationError('Invalid LastRead: verse_key must be a string');
  }

  if (typeof item.page_number !== 'number') {
    throw new ValidationError('Invalid LastRead: page_number must be a number');
  }

  if (typeof item.qpc_uthmani_hafs !== 'string') {
    throw new ValidationError('Invalid LastRead: qpc_uthmani_hafs must be a string');
  }
  }
}
