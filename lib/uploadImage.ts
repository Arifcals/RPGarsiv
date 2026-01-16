import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Resim dosyasını Firebase Storage'a yükler
 * @param file Yüklenecek dosya
 * @param folder Dosyanın yükleneceği klasör (örn: "games")
 * @returns Download URL
 */
export async function uploadImage(file: File, folder: string = "games"): Promise<string> {
  try {
    // Dosya adını benzersiz yap
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Dosyayı yükle
    const snapshot = await uploadBytes(storageRef, file);

    // Download URL'i al
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Resim yükleme hatası:", error);
    throw new Error("Resim yüklenemedi");
  }
}

/**
 * Firebase Storage'dan resim siler
 * @param imageUrl Silinecek resmin URL'i
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) return;

    // URL'den dosya yolunu çıkar
    const urlParts = imageUrl.split("/o/")[1];
    if (!urlParts) return;

    const filePath = decodeURIComponent(urlParts.split("?")[0]);
    const storageRef = ref(storage, filePath);

    await deleteObject(storageRef);
  } catch (error) {
    console.error("Resim silme hatası:", error);
    // Hata fırlatmıyoruz, çünkü dosya zaten silinmiş olabilir
  }
}
