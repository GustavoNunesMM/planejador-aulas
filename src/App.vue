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

        <!-- Adicionar Aula Compacto -->
        <div class="mb-4 bg-white p-4 rounded-xl shadow-md">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div class="relative">
                    <date-picker
                    v-model="novaAula.data"
                    :min-date="new Date()"
                    model-type="date"
                    :disabled-dates="disableDate"
                    inputFormat="dd/MM/yyyy"
                    class="w-full border rounded-md p-2"
                    input-class="rounded-lg w-full"
                    prevent-disable-date-selection="true"
                />

                </div>
                <input v-model="novaAula.titulo" placeholder="Título da aula" class="p-2 border rounded-lg">

                <label class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="file" @change="handleImageUpload" accept="image/*" class="hidden">
                    <span class="text-blue-600">📎 Adicionar Imagem</span>
                    <span v-if="imageAdded" class="text-green-500 text-sm">✓</span>
                </label>
            </div>

            <textarea v-model="novaAula.conteudo" placeholder="Conteúdo detalhado"
                class="w-full p-2 border rounded-lg mb-2 h-24"></textarea>

            <button @click="adicionarAula" class="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                + Adicionar Aula
            </button>
        </div>

        <!-- Lista de Aulas Compacta -->
        <div class="space-y-2">
            <div v-for="(aula, index) in aulas" :key="index" class="bg-white p-3 rounded-lg shadow-sm border group relative">
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
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-sm">{{ aula.titulo }}</span>
                        <span class="text-gray-500 text-xs">{{ formatDate(aula.data) }}</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">{{ aula.conteudo }}</p>
                    <div class="flex gap-1 overflow-x-auto">
                        <img v-for="(img, i) in aula.materiais" :key="i" :src="img"
                            class="h-16 w-16 object-cover rounded border">
                    </div>
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
        <div class="bg-white p-6 rounded-xl shadow-md">
            <div class="flex gap-4 flex-wrap">
                <button @click="gerarPDF" class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Exportar PDF
                </button>
                <button @click="exportarExcel" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
                    Exportar Excel
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DatePicker from 'vue3-datepicker';
import jsPDF from 'jspdf';
import { utils, writeFileXLSX } from 'xlsx';
import 'vue-datepicker-next/index.css'; // Importa o CSS do datepicker

interface DiaConfigurado {
    dia: string;
    quantidade: number;
}

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
    materiais: string[];
}

export default defineComponent({
    components: { DatePicker },
    data() {
        return {
            date: new Date(),
            professor: '',
            conteudoGeral: '',
            showConfig: false,
            diasDisponiveis: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
            disableDate: {
                to: new Date(2025, 11, 31), // Highlight all dates up to specific date
                from: new Date(2025, 0,1), // Highlight all dates after specific date
                dates: [new Date(2025,1,16)] as any[],
                includeDisabled: true // Highlight disabled dates
            },
            novoDia: { dia: 'Segunda', quantidade: 1 } as DiaConfigurado,
            diasConfigurados: [] as DiaConfigurado[],
            novaAula: {
                data: new Date(),
                titulo: '',
                conteudo: '',
                materiais: []
            } as Aula,
            aulas: [] as Aula[],
            edicaoIndex: -1,
            edicaoBuffer: {} as Aula,
            imageAdded: false,
            ultimaData: null as Date | null
        };
    },

    methods: {
        getDisabledDates() {
            const year = new Date().getFullYear();
            const disabledDates: Date[] = []; // Array de strings no formato 'YYYY-MM-DD'

            // Para cada dia da semana configurado, gera as datas para o ano atual
            this.diasConfigurados.forEach(el => {
                let currentDate = new Date(year, 0, 1); // Início do ano
                const dayOfWeek = currentDate.getDay(); // Obtém o dia da semana (0 = Domingo, 1 = Segunda, etc.)
                const indexDia = this.diasDisponiveis.findIndex(element => element === el.dia);

                // Ajuste para o primeiro dia correto
                let daysToAdd = indexDia - dayOfWeek;
                if (daysToAdd <= 0) daysToAdd += 7;

                // Calcula as datas para cada semana do ano
                while (currentDate.getFullYear() === year) {
                    currentDate.setDate(currentDate.getDate() + daysToAdd);
                    // Adiciona a data no formato 'YYYY-MM-DD'
                    disabledDates.push(currentDate); 
                    daysToAdd = 7; // Avança uma semana
                }
            });

            // Atualiza a propriedade reativa de disableDate
            this.disableDate.dates = disabledDates;
        },

        adicionarDia() {
            const existente = this.diasConfigurados.find(d => d.dia === this.novoDia.dia);

            if (existente) {
                existente.quantidade = this.novoDia.quantidade; // Atualiza a quantidade se já existir
            } else if (this.novoDia.quantidade > 0) {
                this.diasConfigurados.push({ ...this.novoDia });
                this.getDisabledDates(); // Atualiza as datas desabilitadas
            }

            this.novoDia = { dia: 'Segunda', quantidade: 1 }; // Resetando o input
        },
        removerDia(index: number) {
            this.diasConfigurados.splice(index, 1);
        },
        calcularProximaData() {
            if (!this.ultimaData) return new Date();
            const novaData = new Date(this.ultimaData);
            novaData.setDate(novaData.getDate() + 7);
            return novaData;
        },

        adicionarAula() {
            const aula = {
                ...this.novaAula,
                data: new Date(this.novaAula.data)
            };

            this.aulas.push(aula);
            this.ultimaData = aula.data;

            // Resetar formulário
            this.novaAula = {
                data: this.calcularProximaData(),
                titulo: '',
                conteudo: '',
                materiais: []
            };
        },

        removerAula(index: number) {
            this.aulas.splice(index, 1);
        },

        formatDate(date: Date) {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        gerarPDF() {
            const doc = new jsPDF();
            let yPos = 20;

            // Cabeçalho
            doc.setFontSize(18);
            doc.text(`Professor: ${this.professor}`, 14, yPos);
            yPos += 10;
            doc.text(`Conteúdo: ${this.conteudoGeral}`, 14, yPos);
            yPos += 15;

            
            // Aulas
            doc.setFontSize(12);
            this.aulas.forEach((aula, index) => {
                doc.text(`${index + 1}. ${aula.titulo} (${this.formatDate(aula.data)})`, 14, yPos);
                yPos += 10;
                
                const splitContent = doc.splitTextToSize(aula.conteudo, 180);
                splitContent.forEach((line: string) => {
                    doc.text(line, 16, yPos);
                    yPos += 7;
                });

                // Imagens
                aula.materiais.forEach((imgSrc, imgIndex) => {
                    if (imgIndex % 2 === 0 && imgIndex !== 0) yPos += 55;

                    const img = new Image();
                    img.src = imgSrc;
                    doc.addImage(img, 'JPEG', imgIndex % 2 === 0 ? 16 : 106, yPos, 40, 30);

                    if (imgIndex % 2 !== 0) yPos += 65;
                });

                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save(`${this.professor}_${this.conteudoGeral}.pdf`);
        },

        exportarExcel() {
            const worksheet = utils.json_to_sheet(
                this.aulas.map(aula => ({
                    Data: this.formatDate(aula.data),
                    Título: aula.titulo,
                    Conteúdo: aula.conteudo,
                    Materiais: aula.materiais.length ? 'Com imagens' : 'Sem materiais'
                }))
            );

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Aulas');
            writeFileXLSX(workbook, `${this.professor}_aulas.xlsx`);
        },

        handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    this.novaAula.materiais.push(e.target.result as string);
                    this.imageAdded = true;
                    setTimeout(() => this.imageAdded = false, 2000);
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
        },

        iniciarEdicao(index: number) {
            this.edicaoIndex = index;
            this.edicaoBuffer = { ...this.aulas[index] };
        },

        salvarEdicao(index: number) {
            this.aulas.splice(index, 1, this.edicaoBuffer);
            this.cancelarEdicao();
        },

        cancelarEdicao() {
            this.edicaoIndex = -1;
            this.edicaoBuffer = {} as Aula;
        },

        formatDatePreview(date: Date) {
            return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
        },

    }
});
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