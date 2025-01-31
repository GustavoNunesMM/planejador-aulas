<template>
    <div class="space-y-2 mt-2">
        <div v-for="(aula, index) in aulas" :key="index"
            class="bg-white p-3 rounded-lg shadow-sm border group relative">
            <!-- Botão de Edição -->
            <button @click="iniciarEdicao(index)"
                class="absolute right-2 top-2 mr-6 opacity-0 group-hover:opacity-100 text-blue-500">
                ✎
            </button>

            <button @click="removerAula(index)"
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500">
                ❌
            </button>

            <!-- Modo Visualização -->
            <div v-if="edicaoIndex !== index">
                <!-- Título destacado -->
                <h3 class="font-semibold text-lg text-blue-600 whitespace-pre-wrap break-words ">{{ aula.titulo }}</h3>
                <p class="whitespace-pre-wrap break-words  text-gray-600 text-sm mt-2" >{{ aula.conteudo }}</p>
                <span class="absolute bottom-2 right-2 text-gray-500 text-xs">
                    {{ formatDate(aula.data) }}
                </span>
            </div>

            <!-- Modo Edição -->
            <div v-else class="space-y-2">
                <input v-model="edicaoBuffer.titulo" class="p-1 border rounded w-full text-sm">
                <textarea v-model="edicaoBuffer.conteudo" class="p-1 border rounded w-full text-sm h-16"></textarea>
                <div class="flex gap-1">
                    <button @click="salvarEdicao(index)"
                        class="text-sm bg-green-100 text-green-600 px-2 rounded">Salvar</button>
                    <button @click="cancelarEdicao"
                        class="text-sm bg-gray-100 text-gray-600 px-2 rounded">Cancelar</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent  } from 'vue';
import type { PropType } from 'vue'

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}

export default defineComponent({
    data() {
        return {
            edicaoIndex: -1,
            edicaoBuffer: {} as Aula,
        }
    },
    props:{ 
        aulas: {
            default: () => [] ,
            type: Array as PropType<Aula[]>
        },
    },
    methods: {
        iniciarEdicao(index: number) {
            this.edicaoIndex = index
            this.edicaoBuffer = { ...this.aulas[index] }
        },
        salvarEdicao(index: number) {
            let aulas =  this.aulas
            aulas[index] = this.edicaoBuffer
            console.log('aulas att',aulas,'edicaobuffer', this.edicaoBuffer)
            this.$emit('atualizarAulas', aulas)
            this.cancelarEdicao()
        },
        cancelarEdicao() {
            this.edicaoIndex = -1
            this.edicaoBuffer = {} as Aula
        },
        removerAula(index: number) {
            this.aulas.splice(index, 1)
            this.$emit('AlteraAulas', this.aulas)
        },
        formatDate(date: Date) {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        }
    }
})
</script>