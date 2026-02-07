import Image from "next/image";
import styles from "./page.module.css";

// Dodaj async tutaj ↓
export default async function Home() {
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/112OyXCrzHvFSaZISEJJCIrQcq-Cs9t-4Nqr5dhtGfQE/export?format=csv";

  async function getPosts() {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    console.log("CSV Text:", text);
    console.log("Parsed Data:", parseCSVtoJSON(text));
    return parseCSVtoJSON(text);
  }

  function parseCSVtoJSON(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());

    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });

    return data;
  }

  // Dodaj await tutaj ↓
  const posts = await getPosts();

  return (
    <div className={styles.page}>
      <div className={styles.offersContainer}>
        {posts.map((offer, index) => (
          <div key={index} className={styles.offerItem}>
            <Image
              src={offer.image || "https://picsum.photos/id/237/200/300"}
              alt={offer.name || "Offer"}
              width={240}
              height={240}
            />
            <div className={styles.offerDescription}>
              <h3>{offer.Produkt || "Offer"}</h3>
              <p>{offer.Ilość || "Ilość"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}