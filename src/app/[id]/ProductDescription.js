import { parseOpis } from '@/lib/opis';
import s from './product.module.css';

function DescriptionList({ items }) {
  const specs = items.filter(i => i.label);
  const points = items.filter(i => !i.label);

  return (
    <>
      {specs.length > 0 && (
        <dl className={s.descSpecs}>
          {specs.map((item, i) => (
            <div key={i} className={s.descSpecRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {points.length > 0 && (
        <ul className={s.descList}>
          {points.map((item, i) => <li key={i}>{item.text}</li>)}
        </ul>
      )}
    </>
  );
}

// Wolny tekst opisu z arkusza → tytuł, akapity, śródtytuły, parametry i lista cech
export default function ProductDescription({ text }) {
  const blocks = parseOpis(text);

  return (
    <div className={s.desc}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'title':   return <p key={i} className={s.descTitle}>{block.text}</p>;
          case 'heading': return <h3 key={i} className={s.descHeading}>{block.text}</h3>;
          case 'list':    return <DescriptionList key={i} items={block.items} />;
          default:        return <p key={i} className={s.descParagraph}>{block.text}</p>;
        }
      })}
    </div>
  );
}
