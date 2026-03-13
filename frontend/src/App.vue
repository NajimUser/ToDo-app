<template>
  <!-- Conteneur principal de l'application -->
  <div class="container">
    <h1>Ma To-Do List</h1>

    <!-- FORMULAIRE : Ajouter une tâche -->
    <div class="form">
      <!-- input lié à newTask avec v-model (liaison bidirectionnelle) -->
      <input 
        v-model="newTask" 
        type="text" 
        placeholder="Ajouter une tâche..."
      />
      <!-- Quand on clique, on appelle la fonction addTask -->
      <button @click="addTask">Add</button>
    </div>

    <!-- LISTE : Afficher toutes les tâches -->
    <!-- v-for = boucle sur chaque tâche du tableau tasks -->
    <ul>
      <li v-for="task in tasks" :key="task.id">
        
        <!-- Titre de la tâche -->
        <!-- Si on est en mode édition, afficher un input, sinon le titre -->
        <span v-if="editingId !== task.id">{{ task.title }}</span>
        <input v-else v-model="editingTitle" type="text" />

        <!-- Statut de la tâche -->
        <span>{{ task.completed ? '✅' : '❌' }}</span>

        <!-- BOUTONS -->
        <!-- Bouton Edit : passe en mode édition -->
        <button @click="startEdit(task)">Edit</button>
        
        <!-- Bouton Save : visible seulement en mode édition -->
        <button v-if="editingId === task.id" @click="saveEdit(task)">Save</button>
        
        <!-- Bouton Delete : supprime la tâche -->
        <button @click="deleteTask(task.id)">Delete</button>
        
        <!-- Bouton Mark : change le statut -->
        <button @click="toggleComplete(task)">
          {{ task.completed ? 'Mark as incomplete' : 'Mark as completed' }}
        </button>

      </li>
    </ul>
  </div>
</template>

<script>
// On importe axios pour faire les requêtes HTTP vers le backend
import axios from 'axios'

export default {
  // data() contient toutes les variables de l'application
  data() {
    return {
      tasks: [],        // tableau de toutes les tâches
      newTask: '',      // titre de la nouvelle tâche
      editingId: null,  // id de la tâche en cours d'édition
      editingTitle: '', // titre modifié
    }
  },

  // mounted() s'exécute quand la page est chargée
  mounted() {
    this.getTasks() // on charge les tâches au démarrage
  },

  methods: {
    // GET : Récupérer toutes les tâches
    async getTasks() {
      const response = await axios.get('http://localhost:3000/tasks')
      this.tasks = response.data
    },

    // POST : Ajouter une nouvelle tâche
    async addTask() {
      if (!this.newTask) return // si le champ est vide, on ne fait rien
      await axios.post('http://localhost:3000/tasks', { title: this.newTask })
      this.newTask = '' // on vide le champ
      this.getTasks()   // on recharge la liste
    },

    // DELETE : Supprimer une tâche
    async deleteTask(id) {
      await axios.delete(`http://localhost:3000/tasks/${id}`)
      this.getTasks() // on recharge la liste
    },

    // Passer en mode édition
    startEdit(task) {
      this.editingId = task.id
      this.editingTitle = task.title
    },

    // PUT : Sauvegarder la modification du titre
    async saveEdit(task) {
      await axios.put(`http://localhost:3000/tasks/${task.id}`, {
        title: this.editingTitle,
        completed: task.completed
      })
      this.editingId = null // on quitte le mode édition
      this.getTasks()       // on recharge la liste
    },

    // PUT : Changer le statut terminée/non terminée
    async toggleComplete(task) {
      await axios.put(`http://localhost:3000/tasks/${task.id}`, {
        title: task.title,
        completed: !task.completed // on inverse le statut
      })
      this.getTasks() // on recharge la liste
    }
  }
}
</script>

<style>
/* Style général */
.container {
  max-width: 600px;
  margin: 50px auto;
  font-family: Arial, sans-serif;
}

/* Formulaire d'ajout */
.form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  padding: 8px;
  font-size: 16px;
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  margin-left: 5px;
}

button:hover {
  opacity: 0.8;
}

/* Liste des tâches */
ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
</style>