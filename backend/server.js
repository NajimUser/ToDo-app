// On importe Express pour créer le serveur
const express = require('express');

// On importe cors pour autoriser le frontend (port 5173)
// à communiquer avec le backend (port 3000)
const cors = require('cors');

// On importe notre connexion à la base de données
const pool = require('./db');

// On charge les variables du fichier .env
require('dotenv').config();

// On crée l'application Express
const app = express();

// On active cors → frontend peut parler au backend
app.use(cors());

// On dit à Express de comprendre le format JSON
// (les données envoyées depuis le frontend)
app.use(express.json());

// ===== ROUTE 1 : GET /tasks =====
// Quand le frontend demande la liste des tâches
app.get('/tasks', async (req, res) => {
  // On interroge la BDD pour avoir toutes les tâches
  const result = await pool.query('SELECT * FROM tasks');
  // On renvoie les tâches en JSON au frontend
  res.json(result.rows);
});

// ===== ROUTE 2 : POST /tasks =====
// Quand le frontend veut créer une nouvelle tâche
app.post('/tasks', async (req, res) => {
  // On récupère le titre envoyé par le frontend
  const { title } = req.body;
  // On insère la nouvelle tâche dans la BDD
  // $1 = title (protection contre les injections SQL)
  const result = await pool.query(
    'INSERT INTO tasks (title, completed) VALUES ($1, false) RETURNING *',
    [title]
  );
  // On renvoie la tâche créée au frontend
  res.json(result.rows[0]);
});

// ===== ROUTE 3 : PUT /tasks/:id =====
// Quand le frontend veut modifier une tâche existante
app.put('/tasks/:id', async (req, res) => {
  // On récupère l'id de la tâche dans l'URL ex: /tasks/1
  const { id } = req.params;
  // On récupère le nouveau titre et statut envoyés par le frontend
  const { title, completed } = req.body;
  // On met à jour la tâche dans la BDD
  const result = await pool.query(
    'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
    [title, completed, id]
  );
  // On renvoie la tâche modifiée au frontend
  res.json(result.rows[0]);
});

// ===== ROUTE 4 : DELETE /tasks/:id =====
// Quand le frontend veut supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
  // On récupère l'id de la tâche dans l'URL
  const { id } = req.params;
  // On supprime la tâche de la BDD
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  // On confirme la suppression au frontend
  res.json({ message: 'Tâche supprimée' });
});

// ===== DÉMARRER LE SERVEUR =====
// Le serveur écoute sur le port 3000
// http://localhost:3000
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});

// Résumé — Comment le frontend parle au backend
/*     Frontend (port 5173)          Backend (port 3000)
      |                              |
      |--- GET /tasks -------------> | → lit la BDD → renvoie les tâches
      |--- POST /tasks ------------> | → ajoute dans la BDD
      |--- PUT /tasks/1 -----------> | → modifie dans la BDD
      |--- DELETE /tasks/1 ------->  | → supprime de la BDD */