export default () => ({

     database: {
          connectionString: process.env.CONNECTION_STRING
     },
     jwt: {
          jwtSecret: process.env.JWT_SECRET
     }
});