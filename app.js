const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
// GET all movies

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name 
    FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 2
//Create a new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
        '${movieName}',
        '${leadActor}'
      );`;

  const addMovieResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
//GET a movie based on movie_id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
    *
    FROM
    movie 
    WHERE 
    movie_id = ${movieId};`;
  const movieResponse = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieResponse));
});

//API 4
//Update a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Delete a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDbObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6
//GET all the directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;`;
  const allDirectors = await db.all(getDirectorsQuery);
  response.send(
    allDirectors.map((eachDirector) => convertDbObject(eachDirector))
  );
});

//API 7
//GET list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuery = `
    SELECT movie_name as movieName 
    FROM movie
    WHERE 
    director_id=${directorId};`;
  const getMoviesByDirector = await db.all(getDirectorsQuery);
  response.send(getMoviesByDirector);
});
