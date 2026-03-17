import * as https from 'https';
import * as cheerio from 'cheerio';

const RIPTE_URL = 'https://www.argentina.gob.ar/trabajo/seguridadsocial/ripte';

export async function getRipteVariation(): Promise<number | null> {
  return new Promise((resolve, reject) => {
    https
      .get(RIPTE_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const $ = cheerio.load(data);
            const element = $('td[data-label]')
              .filter((_, el) => {
                const label = $(el).attr('data-label');
                const normalized = label?.replace(/\s+/g, ' ').trim() || '';
                return normalized === 'Variación respecto mes anterior';
              })
              .first();
            const text = element.text().trim();
            const match = text.match(/[-+]?\d+,\d+/);
            if (match) {
              const value = parseFloat(match[0].replace(',', '.'));
              resolve(value);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
