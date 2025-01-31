<template>
    <div class="container mx-auto p-4 max-w-4xl">
        <!-- Cabeçalho Compacto -->
        <div class="mb-4 bg-white p-4 rounded-xl shadow-md">
            <div class="flex flex-col md:flex-row gap-4">
                <input v-model="professor" placeholder="Professor" class="p-2 border rounded-lg flex-1">
                <input v-model="conteudoGeral" placeholder="Conteúdo" class="p-2 border rounded-lg flex-1">
            </div>
        </div>

        <!-- Configuração de Dias (Collapsible) -->
        <confiDias @diasConfig="diasConfig => diasConfigurados = diasConfig"></confiDias>

        <!-- Adicionar Aula Compacto -->
        <adicionarAula @AlteraAulas="value => aulas = value"></adicionarAula>

        <referencias @ref="value=> referencias = value"></referencias>

        <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="flex gap-4 flex-wrap">
                <button @click="gerarPDF" class="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors">
                    Exportar PDF
                </button>
                <button @click="gerarExcel" class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Exportar Excel
                </button>
                <button @click="gerarWord" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Exportar Word
                </button>
            </div>
        </div>
        
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import referencias from './components/referencias.vue'
import confiDias from './components/configDias.vue'
import adicionarAula from './components/adicionaAula.vue'

import gerarPdfFunc from './service/gerarPdf'
import gerarExcelFunc from './service/gerarExcel'
import gerarWordFunc from './service/gerarWord'

interface DiaConfigurado {
    dia: string;
    quantidade: number;
}

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}

export default defineComponent({
    components: { referencias, confiDias, adicionarAula },
    data() {
        return {
            professor: '',
            conteudoGeral: '',
            diasConfigurados: [] as DiaConfigurado[],
            aulas: [] as Aula[],
            referencias: [] as string[], // Lista de referências
        };
    },

    methods: {
        gerarPDF() {
            gerarPdfFunc(this.diasConfigurados, this.professor, this.aulas, this.referencias)
        },
        gerarExcel(){
            gerarExcelFunc(this.aulas, this.professor)
        },
        gerarWord() {
            gerarWordFunc(this.diasConfigurados, this.professor, this.aulas, this.referencias)
        }
    }
})
</script>
