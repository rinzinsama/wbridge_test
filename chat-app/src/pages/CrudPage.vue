<template>
    <div>

        <q-card>
            <q-card-section>
                <q-input v-model="newItem" label="New Item" />
                <q-btn label="Add" @click="addItem" />
            </q-card-section>

            <q-card-section>
                <q-list bordered>
                    <q-item v-for="(item, index) in items" :key="index">
                        <q-item-section>
                            <q-input v-model="item.name" :label="'Edit Item ' + (index + 1)" />
                        </q-item-section>
                        <q-item-section side>
                            <q-btn icon="delete" @click="deleteItem(item._id)" />
                            <q-btn icon="save" @click="updateItem(item)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>

    </div>
</template>
  
<script>
import axios from 'axios';

export default {
    data() {
        return {
            newItem: '',
            items: [],
        };
    },

    created() {
        this.getItems();
    },

    methods: {
        getItems() {
            axios.get(process.env.APP_URL + '/api/items/')
                .then(response => {
                    this.items = response.data;
                })
                .catch(error => {
                    console.error('Error retrieving items:', error);
                });
        },

        addItem() {
            axios.post(process.env.APP_URL + '/api/items', { name: this.newItem })
                .then(() => {
                    this.newItem = '';
                    this.getItems();
                })
                .catch(error => {
                    console.error('Error adding item:', error);
                });
        },

        deleteItem(itemId) {
            axios.delete(process.env.APP_URL + `/api/items/${itemId}`)
                .then(() => {
                    this.getItems();
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                });
        },
        updateItem(item) {
            axios.put(`/api/items/${item._id}`, { name: item.name })
                .then(() => {
                    this.getItems();
                })
                .catch(error => {
                    console.error('Error updating item:', error);
                });
        },
    },
};
</script>
  