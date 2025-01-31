import { utils, writeFileXLSX } from 'xlsx';

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}
export default function exportarExcel(aulas:Aula[], professor:string) {
    const worksheet = utils.json_to_sheet(
        aulas.map(aula => ({
            Data: formatDate(aula.data),
            Título: aula.titulo,
            Conteúdo: aula.conteudo,
        }))
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Aulas');
    writeFileXLSX(workbook, `${professor}_aulas.xlsx`);
}
function formatDate(date: Date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}