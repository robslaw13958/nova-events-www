import Image from "next/image";
import styles from "./page.module.css";

export default async function Home() {
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/112OyXCrzHvFSaZISEJJCIrQcq-Cs9t-4Nqr5dhtGfQE/export?format=csv";

  async function getPosts() {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
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

  function groupProductsByVariant(products) {
    const grouped = {};

    products.forEach((product) => {
      // Klucz grupujący: wszystko OPRÓCZ Kolor, Produkt (id), zdjęcie, Cena, dostępność, outlet
      const key = `${product.Nazwa}_${product.Linia}_${product.Typ}_${product.sztaplowanie}_${product.wymiary}`;

      if (!grouped[key]) {
        // Pierwszy wariant - stworz bazowy obiekt
        grouped[key] = {
          Nazwa: product.Nazwa,
          Linia: product.Linia,
          Typ: product.Typ,
          sztaplowanie: product.sztaplowanie,
          wymiary: product.wymiary,
          opis: product.opis,
          warianty: [],
        };
      }

      // Dodaj wariant do grupy
      grouped[key].warianty.push({
        id: product.Produkt,
        kolor: product.Kolor,
        cena: product.Cena,
        zdjęcie: product.zdjęcie,
        dostępność: product.dostępność,
        outlet: product.outlet,
      });
    });

    return Object.values(grouped);
  }

  const posts = await getPosts();
  const groupedProducts = groupProductsByVariant(posts);

  return (
    <div className={styles.page}>
      <div className={styles.offersContainer}>
        {groupedProducts.map((product, index) => {
          // Pierwszy wariant jako domyślny
          const defaultVariant = product.warianty[0];

          return (
            <div key={index} className={styles.offerItem}>
              {/* Badge outlet - pokazuj tylko jeśli pierwszy wariant to outlet */}
              {defaultVariant.outlet === "Tak" && (
                <div className={styles.outletBadge}>OUTLET</div>
              )}

              <Image
                src={defaultVariant.zdjęcie || "https://ireland.apollo.olxcdn.com/v1/files/l7zo52pdwjm32-PL/image;s=1000x700"}
                alt={product.Nazwa}
                width={288}
                height={240}
                fill={false}
                style={{ objectFit: 'cover' }}
              />

              <div className={styles.offerDescription}>
                <p>{product.Nazwa}</p>
                <p className={styles.price}>{defaultVariant.cena}</p>

                {/* Kwadraciki wariantów - do zrobienia później */}
                <div className={styles.variants}>
                  {product.warianty.map((wariant, i) => (
                    <div
                      key={i}
                      className={styles.variantBox}
                      title={wariant.kolor}
                    >
                      {/* Tutaj będą kwadraciki kolorów */}
                      {wariant.kolor.substring(0, 1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}