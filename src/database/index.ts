import {Connection, createConnection, getConnectionOptions} from 'typeorm';

export default async (): Promise<Connection> => {
  // aqui pega todas as informações que estão dentro do ormconfig.json
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    // esse método assign subscreve a propriedade database de defaultOptions
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === 'test' // sempre que quisermos acessar variáveis de ambiente usa process.env.nomedavariavelambiente
          ? './src/database/database.test.sqlite'
          : defaultOptions.database,
    }),
  );
};