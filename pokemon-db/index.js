const types = require("./types");
const moves = require("./moves");
const pokemons = require("./pokemons");

module.exports = {
  getPokemonTypes: () => {
    return types;
  },

  getPokemonTypeById: id => {
    return types.find(type => type.id === id);
  },
  getMoves: () => {
    return moves;
  },

  getPokemons: ({ pokemonTypeId }) => {
    return pokemons.filter(pokemon =>
      pokemon.types.includes(parseInt(pokemonTypeId))
    );
  },

  getPokemonById: pokemonId => {
    return pokemons.find(pokemon => pokemon.id === pokemonId);
  }
};
