const { ApolloServer, gql, PubSub } = require("apollo-server");

const pubSub = new PubSub();

const {
  getPokemonTypes,
  getPokemons,
  getPokemonTypeById,
  getPokemonById
} = require("./pokemon-db/index");

typeDefs = gql`
  type Query {
    pokemonTypes: [PokemonType]
    pokemons(pokemonTypeId: ID!): [Pokemon]
    pokemon(pokemonId: ID!): Pokemon
    capturedPokemons: [Pokemon]
  }

  type Mutation {
    capturePokemon(pokemonId: ID!): Pokemon
  }

  type Subscription {
    pokemonCaptured: Pokemon
  }

  type PokemonType {
    id: ID!
    name: String!
  }

  type Pokemon {
    id: ID!
    name: String!
    type: [PokemonType]
    image: String!
    thumbnailImage: String!
    base: PokemonBase
  }

  type PokemonBase {
    HP: Int!
    Attack: Int!
    Defense: Int!
    SpecialAttack: Int!
    SpecialDefense: Int!
    Speed: Int!
  }
`;

const inMemoryCapturedPokemons = [];
const POKEMON_CAPTURED = "POKEMON_CAPTURED";

const resolvers = {
  Query: {
    pokemonTypes: () => {
      return getPokemonTypes();
    },
    pokemons: (parent, args) => {
      return getPokemons(args);
    },
    pokemon: (parent, args) => {
      return getPokemonById(args);
    },
    capturedPokemons: () => {
      return inMemoryCapturedPokemons.map(getPokemonById);
    }
  },

  Subscription: {
    pokemonCaptured: {
      subscribe: () => pubSub.asyncIterator([POKEMON_CAPTURED])
    }
  },

  Mutation: {
    capturePokemon: (parent, args) => {
      if (!inMemoryCapturedPokemons.includes(args.pokemonId)) {
        inMemoryCapturedPokemons.push(args.pokemonId);
      }
      const pokemon = getPokemonById(args.pokemonId);
      pubSub.publish(POKEMON_CAPTURED, { pokemonCaptured: pokemon });
      return pokemon;
    }
  },

  Pokemon: {
    type: parent => {
      return parent.types.map(typeId => getPokemonTypeById(typeId));
    },
    image: parent => {
      return `http://localhost:8080/images/${parent.id}${parent.name}.png`;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: "*"
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
