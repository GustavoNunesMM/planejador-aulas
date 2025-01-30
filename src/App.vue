<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Planejador de Aulas</h1>
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="col-span-2">
                    <input v-model="newEntry.date" type="date" class="p-2 border rounded w-full">
                    <small class="text-gray-500">
                        Dia da semana: {{ selectedWeekDay }}
                    </small>
                </div>

                <input v-model="newEntry.activity" placeholder="Nome da aula" class="p-2 border rounded">

                <textarea v-model="newEntry.materials" placeholder="Materiais" class="p-2 border rounded"></textarea>
            </div>

            <div class="mt-4 flex gap-2 flex-wrap">
                <button @click="addEntry" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Adicionar Aula
                </button>

                <label class="flex items-center gap-2">
                    <input type="checkbox" v-model="newEntry.isAssessment">
                    É avaliação?
                </label>
            </div>
        </div>

        <!-- Lista de aulas -->
        <div class="mb-8">
            <div v-for="(entry, index) in sortedEntries" :key="index" class="mb-2 p-4 border rounded bg-white">
                <div v-if="editingIndex !== index" class="flex justify-between items-start">
                    <div>
                        <span class="font-bold" :class="{ 'text-red-600': entry.isAssessment }">
                            {{ formatDate(entry.date) }} ({{ getWeekDay(entry.date) }})
                        </span>
                        - {{ entry.activity }}
                        <p v-if="entry.materials" class="text-sm text-gray-600 mt-1">
                            📦 Materiais: {{ entry.materials }}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="startEdit(index)" class="text-yellow-600 hover:text-yellow-700">
                            ✎
                        </button>
                        <button @click="removeEntry(index)" class="text-red-500 hover:text-red-700">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Modo edição -->
                <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input v-model="editBuffer.date" type="date" class="p-2 border rounded">
                    <input v-model="editBuffer.activity" class="p-2 border rounded">
                    <textarea v-model="editBuffer.materials" class="p-2 border rounded"></textarea>
                    <div class="flex gap-2 items-center">
                        <button @click="saveEdit(index)" class="bg-green-500 text-white px-3 py-1 rounded">
                            ✓
                        </button>
                        <button @click="cancelEdit" class="bg-gray-500 text-white px-3 py-1 rounded">
                            ✕
                        </button>
                        <label class="flex items-center gap-1 text-sm">
                            <input type="checkbox" v-model="editBuffer.isAssessment">
                            Avaliação
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Exportação -->
        <div class="p-4 bg-gray-100 rounded-lg space-y-4">
            <div class="flex gap-4 flex-wrap">
                <button @click="generateReport" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Gerar Relatório Texto
                </button>

                <button @click="generatePDF" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Exportar PDF
                </button>
            </div>

            <pre v-if="reportContent" class="bg-white p-4 rounded">{{ reportContent }}</pre>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import jsPDF from 'jspdf';

interface ClassEntry {
    date: string;
    activity: string;
    materials: string;
    isAssessment: boolean;
}

export default defineComponent({
    data() {
        return {
            newEntry: {
                date: '',
                activity: '',
                materials: '',
                isAssessment: false
            } as ClassEntry,
            entries: [] as ClassEntry[],
            reportContent: '',
            editingIndex: -1,
            editBuffer: {} as ClassEntry,
            weekDayPattern: null as number | null
        };
    },

    computed: {
        sortedEntries(): ClassEntry[] {
            return [...this.entries].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        },

        selectedWeekDay(): string {
            return this.newEntry.date
                ? this.getWeekDay(this.newEntry.date)
                : '';
        }
    },

    watch: {
        'newEntry.date'(newDate) {
            if (newDate) {
                this.weekDayPattern = new Date(newDate).getDay();
            }
        }
    },

    methods: {
        addEntry() {
            if (this.newEntry.date && this.newEntry.activity) {
                this.entries.push({ ...this.newEntry });

                // Configura próxima data automaticamente
                if (this.weekDayPattern !== null) {
                    const lastDate = new Date(this.newEntry.date);
                    const nextDate = new Date(lastDate);
                    nextDate.setDate(lastDate.getDate() + 7);
                    this.newEntry.date = nextDate.toISOString().split('T')[0];
                }

                this.newEntry.activity = '';
                this.newEntry.materials = '';
            }
        },

        startEdit(index: number) {
            this.editingIndex = index;
            this.editBuffer = { ...this.entries[index] };
        },

        saveEdit(index: number) {
            this.entries.splice(index, 1, this.editBuffer);
            this.cancelEdit();
        },

        cancelEdit() {
            this.editingIndex = -1;
            this.editBuffer = {} as ClassEntry;
        },

        removeEntry(index: number) {
            this.entries.splice(index, 1);
        },

        getWeekDay(dateString: string): string {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', { weekday: 'long' });
        },

        formatDate(dateString: string): string {
            return new Date(dateString).toLocaleDateString('pt-BR');
        },

        generateReport() {
            const groupedEntries: { [key: string]: ClassEntry[] } = this.sortedEntries.reduce((acc, entry) => {
            const date = this.formatDate(entry.date);
            if (!acc[date]) acc[date] = [];
                acc[date].push(entry);
                return acc;
            }, {} as { [key: string]: ClassEntry[] });

            let report = 'PLANO ANUAL\n\n';
            for (const [date, entries] of Object.entries(groupedEntries)) {
                report += `  ${date.padEnd(20, ' ')}${entries[0].isAssessment ? '**' : ''}${entries[0].activity}${entries[0].isAssessment ? '**' : ''}\n`;
                for (const entry of entries.slice(1)) {
                report += `  ${''.padEnd(20, ' ')}${entry.isAssessment ? '**' : ''}${entry.activity}${entry.isAssessment ? '**' : ''}\n`;
                if (entry.materials) {
                    report += `  ${''.padEnd(20, ' ')}  Materiais: ${entry.materials}\n`;
                }
                }
                report += '\n';
            }
            this.reportContent = report;
            
        },

        generatePDF() {
            const doc = new jsPDF();
            let yPos = 20;

            doc.setFontSize(18);
            doc.text("Plano Anual de Aulas", 14, 15);

            doc.setFontSize(12);
            this.sortedEntries.forEach(entry => {
                const date = this.formatDate(entry.date);
                const text = `${date} (${this.getWeekDay(entry.date)}) - ${entry.activity}${entry.isAssessment ? ' **AVALIAÇÃO**' : ''}`;

                doc.text(text, 14, yPos);
                yPos += 10;

                if (entry.materials) {
                    doc.setFontSize(10);
                    doc.text(`   Materiais: ${entry.materials}`, 16, yPos);
                    yPos += 7;
                    doc.setFontSize(12);
                }

                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            doc.save('plano-aulas.pdf');
        }
    }
});
</script>