<template>
    <div class="mb-4 bg-white p-4 rounded-xl shadow-md">
        <div class="flex items-center gap-2 mb-2 cursor-pointer" @click="showConfig = !showConfig">
            <span class="font-medium">▼ Configurar Dias/Aulas</span>
        </div>

        <div v-if="showConfig" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select v-model="novoDia.dia" class="p-2 border rounded-lg">
                    <option v-for="dia in diasDisponiveis" :key="dia" :value="dia">{{ dia }}</option>
                </select>
                <input v-model.number="novoDia.quantidade" type="number" placeholder="Aulas/dia"
                    class="p-2 border rounded-lg">
                <button @click="adicionarDia" class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    + Adicionar
                </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div v-for="(dia, index) in diasConfigurados" :key="index"
                    class="bg-gray-50 p-2 rounded flex justify-between items-center">
                    <span class="text-sm">{{ dia.dia }} - quantidade de aulas: {{ dia.quantidade }}</span>
                    <button @click="removerDia(index)" class="text-red-400 hover:text-red-600">×</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface DiaConfigurado {
    dia: string;
    quantidade: number;
}
export default defineComponent({
    data() {
        return {
            diasConfigurados: [] as DiaConfigurado[],
            showConfig: false,
            novoDia: { dia: 'Segunda', quantidade: 1 } as DiaConfigurado,
            diasDisponiveis: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        }
    },
    methods:{
        removerDia(index: number) {
            this.diasConfigurados.splice(index, 1);
            this.$emit('diasConfig', this.diasConfigurados)
        },
        adicionarDia() {
            const existente = this.diasConfigurados.find(d => d.dia === this.novoDia.dia);

            if (existente) {
                existente.quantidade = this.novoDia.quantidade; // Atualiza a quantidade se já existir
            } else if (this.novoDia.quantidade > 0) {
                this.diasConfigurados.push({ ...this.novoDia });
            }
            this.$emit('diasConfig', this.diasConfigurados)
            this.novoDia = { dia: 'Segunda', quantidade: 1 }; // Resetando o input
        },
    }
})
</script>
