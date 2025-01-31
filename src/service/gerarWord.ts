import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

interface Aula {
    data: Date;
    titulo: string;
    conteudo: string;
}
interface DiaConfigurado {
    dia: string;
    quantidade: number;
}

export default async function gerarWord(diasConfigurados: DiaConfigurado[], professor: string, aulas: Aula[], referencias: string[]) {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: "Planejamento de Aula",
                        heading: "Title",
                        alignment: "center",
                    }),
                    new Paragraph({
                        text: `Professor(a): ${professor}`,
                        heading: "Heading2",
                        alignment: "center",
                    }),
                    new Paragraph({ text: "" }),

                    // Dias com aulas
                    new Paragraph({
                        text: "Dias com Aulas:",
                        heading: "Heading3",
                    }),
                    ...diasConfigurados.map(diaConfig =>
                        new Paragraph({
                            text: `${diaConfig.dia} - ${diaConfig.quantidade} aulas`,
                        })
                    ),
                    new Paragraph({ text: "" }),

                    // Tabela de aulas
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Data")] }),
                                    new TableCell({ children: [new Paragraph("Título")] }),
                                    new TableCell({ children: [new Paragraph("Conteúdo")] }),
                                ],
                            }),
                            ...aulas.map(aula =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(formatarDataWord(aula.data))] }),
                                        new TableCell({ children: [new Paragraph(aula.titulo)] }),
                                        new TableCell({ children: [new Paragraph(aula.conteudo)] }),
                                    ],
                                })
                            ),
                        ],
                    }),
                    new Paragraph({ text: "" }),

                    // Referências
                    ...(referencias.length > 0
                        ? [
                            new Paragraph({ text: "Referências:", heading: "Heading3" }),
                            ...referencias.map((ref, index) =>
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `${index + 1}. ${ref}`, style: "Hyperlink" }),
                                    ],
                                })
                            ),
                        ]
                        : []),
                ],
            },
        ],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `Plano de Aulas - ${professor}.docx`);
}

function formatarDataWord(date: Date) {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const diaSemana = dias[date.getDay()];
    return `${dia}/${mes} (${diaSemana})`;
}
