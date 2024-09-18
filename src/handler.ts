import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import connection from './db';

interface SWAPICharacter {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
}

interface TranslatedCharacter {
  nombre: string;
  altura: string;
  peso: string;
  color_cabello: string;
  color_piel: string;
  color_ojos: string;
  año_nacimiento: string;
  genero: string;
}

const translateSWAPICharacter = (character: SWAPICharacter): TranslatedCharacter => ({
  nombre: character.name,
  altura: character.height,
  peso: character.mass,
  color_cabello: character.hair_color,
  color_piel: character.skin_color,
  color_ojos: character.eye_color,
  año_nacimiento: character.birth_year,
  genero: character.gender
});

export const createCharacter = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { swapiUrl } = JSON.parse(event.body!);

    const response = await axios.get<SWAPICharacter>(swapiUrl);
    const translatedCharacter = translateSWAPICharacter(response.data);

    const query = `
      INSERT INTO personajes (nombre, altura, peso, color_cabello, color_piel, color_ojos, año_nacimiento, genero)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(query, Object.values(translatedCharacter));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Personaje creado exitosamente desde SWAPI',
        personaje: translatedCharacter
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo crear el personaje', details: error.message })
    };
  }
};

export const getCharacters = async (): Promise<APIGatewayProxyResult> => {
  try {
    const query = 'SELECT * FROM personajes';
    const [rows] = await connection.query(query);

    return {
      statusCode: 200,
      body: JSON.stringify(rows)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudieron obtener los personajes', details: error.message })
    };
  }
};
