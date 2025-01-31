<template>
    <div class="mb-4 bg-white p-4 rounded-xl shadow-md">
        <div class="grid grid-cols-2 md:grid-cols-2 gap-2 mb-2">
            <div class="relative">
                <date-picker
                v-model="novaAula.data"
                :min-date="new Date()"
                model-type="date"
                inputFormat="dd/MM/yyyy"
                class="w-full border rounded-md p-2"
                input-class="rounded-lg w-full"
                prevent-disable-date-selection="true"
            />
            </div>

            <input v-model="novaAula.titulo" placeholder="Título da aula" class="p-2 border rounded-lg">
        </div>

        <textarea v-model="novaAula.conteudo" placeholder="Conteúdo detalhado"
            class="w-full p-2 border rounded-lg mb-2 h-24"></textarea>

        <button @click="adicionarAula" class="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            + Adicionar Aula
        </button>

        <listaAulasCompacta 
        :aulas="aulas"
        @atualizarAulas="novasAulas => aulas = novasAulas"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import 'vue-datepicker-next/index.css'; // Importa o CSS do datepicker
import DatePicker from 'vue3-datepicker';

import listaAulasCompacta from './listaAulasCompacta.vue';

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}
export default defineComponent({
    components: {DatePicker, listaAulasCompacta},
    data() {
        return {
            novaAula: {
                data: new Date(),
                titulo: '',
                conteudo: '',
            } as Aula,
            aulas: [] as Aula[],
            ultimaData: null as Date | null,
        }
    },
    methods:{
        adicionarAula() {
            const aula = {
                ...this.novaAula,
                data: new Date(this.novaAula.data)
            };

            this.aulas.push(aula);
            this.$emit('AlteraAulas', this.aulas)
            this.ultimaData = aula.data;

            // Resetar formulário
            this.novaAula = {
                data: this.calcularProximaData(),
                titulo: '',
                conteudo: '',
            };
        },

        calcularProximaData() {
            if (!this.ultimaData) return new Date();
            const novaData = new Date(this.ultimaData);
            novaData.setDate(novaData.getDate() + 7);
            return novaData;
        },
    }
})
</script>

<style>
.custom-datepicker {
    @apply bg-white rounded-lg shadow-lg border border-gray-200;
}

.custom-datepicker .dp__main {
    @apply bg-white rounded-lg shadow-lg border border-gray-200;
}

.custom-datepicker .dp__calendar {
    @apply text-gray-800;
}

.custom-datepicker .dp__cell_inner {
    @apply hover:bg-blue-100 rounded-lg;
}

.custom-datepicker .dp__active_date {
    @apply bg-blue-500 text-white font-bold;
}

.custom-datepicker .dp__today {
    @apply border border-blue-500;
}
</style>