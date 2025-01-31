<template>
    <div class="mb-4 bg-white p-6 rounded-xl shadow-md">
        <input
            v-model="novaReferencia"
            placeholder="Adicionar link de referência"
            class="w-full p-2 border rounded-lg"
        />
        <button @click="adicionarReferencia" class="mt-2 bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200">
            + Adicionar Referência
        </button>
        <div class="grid grid-cols-2 gap-2">
            <div v-for="(ref, index) in referencias" :key="index"
                class="bg-gray-50 p-2 rounded flex justify-between items-center">
                <span class="text-sm">{{ ref }}</span>
                <button @click="removerReferencia(index)" class="text-red-400 hover:text-red-600">×</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    data() {
        return {
            novaReferencia: '' as string,
            referencias: [] as string[]
        }
    },
    methods: {
        removerReferencia(index:number) {
            this.referencias.splice(index, 1)
            console.log(this.referencias)
            this.$emit('ref', this.referencias)
        },
        adicionarReferencia() {
            if (this.novaReferencia.trim()) {
            this.referencias.push(this.novaReferencia.trim());
            this.novaReferencia = ''; // Limpa o campo após adicionar
            console.log(this.referencias)
            this.$emit('ref', this.referencias)
            }
        },
    }
})
</script>
