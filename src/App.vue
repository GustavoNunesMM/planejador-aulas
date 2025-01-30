<template>
    <div class="container mx-auto p-4">
        <!-- Cabeçalho com informações do professor -->
        <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="professor" placeholder="Nome do Professor" class="p-2 border rounded">
                <input v-model="conteudoGeral" placeholder="Conteúdo Principal" class="p-2 border rounded">
            </div>
        </div>

        <!-- Seletor de calendário e configuração de aulas -->
        <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <DatePicker v-model="selectedDate" inline :enable-time-picker="false" />

            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input v-model="aulasPorDia" type="number" placeholder="Aulas por dia" class="p-2 border rounded">
                <select v-model="diaSemana" class="p-2 border rounded">
                    <option v-for="dia in diasDaSemana" :key="dia">{{ dia }}</option>
                </select>
            </div>
        </div>

        <!-- Formulário de aulas -->
        <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input v-model="novaAula.data" type="date" class="p-2 border rounded">
                <input v-model="novaAula.titulo" placeholder="Título da Aula" class="p-2 border rounded">
                <textarea v-model="novaAula.conteudo" placeholder="Conteúdo Detalhado"
                    class="p-2 border rounded"></textarea>

                <!-- Upload de materiais -->
                <div class="space-y-2">
                    <input type="file" @change="handleImageUpload" accept="image/*" class="w-full">
                    <input v-model="novoLink" placeholder="Link externo" class="p-2 border rounded">
                    <button @click="addMaterial" class="bg-blue-500 text-white px-2 py-1 rounded">
                        Adicionar Material
                    </button>
                </div>
            </div>

            <button @click="addAula" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Adicionar Aula
            </button>
        </div>

        <!-- Listagem de aulas -->
        <div class="mb-8 space-y-4">
            <div v-for="(aula, index) in aulas" :key="index" class="bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold">{{ aula.titulo }}</h3>
                        <p class="text-sm text-gray-600">{{ formatDate(aula.data) }}</p>
                        <p class="mt-2">{{ aula.conteudo }}</p>
                        <div class="mt-2 space-y-1">
                            <div v-for="(material, mIndex) in aula.materiais" :key="mIndex">
                                <a v-if="material.tipo === 'link'" :href="material.conteudo" target="_blank"
                                    class="text-blue-500">
                                    {{ material.conteudo }}
                                </a>
                                <img v-else :src="material.conteudo" class="max-w-[200px] mt-2">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Exportação -->
        <div class="bg-gray-100 p-4 rounded-lg space-y-4">
            <div class="flex gap-4 flex-wrap">
                <button @click="generatePDF" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Exportar PDF
                </button>
                <button @click="exportToExcel" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Exportar Excel
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DatePicker from 'vue-datepicker-next';
import jsPDF from 'jspdf';
import { utils, writeFile } from 'xlsx';
import 'vue-datepicker-next/index.css'; // Importe o CSS

interface Aula {
    data: string;
    titulo: string;
    conteudo: string;
    materiais: Material[];
}

interface Material {
    tipo: 'imagem' | 'link';
    conteudo: string;
}

export default defineComponent({
    components: { DatePicker },
    data() {
        return {
            professor: '',
            conteudoGeral: '',
            selectedDate: new Date(),
            aulasPorDia: 1,
            diaSemana: 'Segunda',
            diasDaSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
            novaAula: {
                data: '',
                titulo: '',
                conteudo: '',
                materiais: []
            } as Aula,
            novoLink: '',
            aulas: [] as Aula[],
            ultimaData: null as Date | null
        };
    },

    methods: {
        calculateNextDate() {
            if (!this.ultimaData) return new Date();
            const nextDate = new Date(this.ultimaData);
            nextDate.setDate(nextDate.getDate() + 7);
            return nextDate;
        },

        handleImageUpload(event: Event) {
            const input = event.target as HTMLInputElement;
            if (input.files?.[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        this.novaAula.materiais.push({
                            tipo: 'imagem',
                            conteudo: e.target.result as string
                        });
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        },

        addMaterial() {
            if (this.novoLink) {
                this.novaAula.materiais.push({
                    tipo: 'link',
                    conteudo: this.novoLink
                });
                this.novoLink = '';
            }
        },

        addAula() {
            if (!this.novaAula.data) {
                const nextDate = this.calculateNextDate();
                this.novaAula.data = nextDate.toISOString().split('T')[0];
            }

            this.aulas.push({ ...this.novaAula });
            this.ultimaData = new Date(this.novaAula.data);

            // Reset form
            this.novaAula = {
                data: '',
                titulo: '',
                conteudo: '',
                materiais: []
            };
        },

        formatDate(date: string) {
            return new Date(date).toLocaleDateString('pt-BR');
        },

        async generatePDF() {
            const doc = new jsPDF();
            let yPos = 20;

            // Cabeçalho
            doc.setFontSize(18);
            doc.text(`Professor: ${this.professor}`, 14, yPos);
            yPos += 10;
            doc.text(`Conteúdo: ${this.conteudoGeral}`, 14, yPos);
            yPos += 15;

            // Conteúdo das aulas
            doc.setFontSize(12);
            this.aulas.forEach(aula => {
                doc.text(`Data: ${this.formatDate(aula.data)} - ${aula.titulo}`, 14, yPos);
                yPos += 10;

                // Conteúdo
                const splitText = doc.splitTextToSize(aula.conteudo, 180);
                splitText.forEach((line: string) => {
                    doc.text(line, 16, yPos);
                    yPos += 7;
                });

                // Materiais
                aula.materiais.forEach( async (material) => {
                    if (material.tipo === 'imagem') {
                        const img = new Image();
                        img.src = material.conteudo;
                        await new Promise(resolve => {
                            img.onload = () => {
                                doc.addImage(img, 'JPEG', 16, yPos, 50, 50);
                                yPos += 55;
                                resolve(true);
                            };
                        });
                    } else {
                        doc.textWithLink(`Link: ${material.conteudo}`, 16, yPos, { url: material.conteudo });
                        yPos += 10;
                    }
                });

                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save(`${this.professor}-${this.conteudoGeral}.pdf`);
        },

        exportToExcel() {
            const worksheet = utils.json_to_sheet(this.aulas.map(aula => ({
                Data: this.formatDate(aula.data),
                Título: aula.titulo,
                Conteúdo: aula.conteudo,
                Materiais: aula.materiais.map(m => m.tipo === 'link' ? m.conteudo : '[Imagem]').join(', ')
            })));

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Aulas');
            writeFile(workbook, `${this.professor}-aulas.xlsx`);
        }
    }
});
</script>

<style>

.max-w-\[200px\] {
    max-width: 200px;
}
</style>