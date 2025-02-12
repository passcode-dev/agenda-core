"use client";
import Link from "next/link";
import { Calendar, IdCard, Pencil, Phone, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import AlunoService from "@/lib/service/alunoService";
import Table from "@/components/tables/Tables";
import { PaginationUI } from "@/components/paginationCustom";
import FilterGroup from "@/components/Filters/FilterGroup";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertDialogUI } from "@/components/alert";
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FilterModal from "@/components/Filters/FilterModal";
import styled from "styled-components";


const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 9998;
`;

const GenericModalContent = styled.div`
    position: fixed;
    top: 50px;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 9999;

    opacity: 0;
    transform: translateY(-20px);
    animation: slideDown 0.3s ease-out forwards;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;


const ContainerLogs = styled.div`
    width: 100%;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    overflow: scroll;
`;

const LogContainer = styled.div`
    padding: 10px;
    margin-top: 10px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: 5px solid #007bff;
`;

const InfoContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    padding: 20px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
`;

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    transition: all 0.3s ease-in-out;
    span {
        font-size: 14px;
        font-weight: 600;
        color: #777;
        text-transform: uppercase;
        margin-bottom: 4px;
    }
`;

export default function Alunos() {
    const aulasMarcadas = [
        {
            data: "2025-02-15",
            hora: "10:00",
            mensagem: "Oi, gostaria de agendar uma aula para o dia 15 de fevereiro às 10:00."
        },
        {
            data: "2025-02-16",
            hora: "14:30",
            mensagem: "Olá! Poderia marcar uma aula no dia 16 de fevereiro às 14:30? Aguardo confirmação."
        },
        {
            data: "2025-02-17",
            hora: "08:00",
            mensagem: "Oi! Preciso de uma aula no dia 17 de fevereiro, às 08:00. Obrigado!"
        },
        {
            data: "2025-02-18",
            hora: "19:00",
            mensagem: "Oi, gostaria de agendar para o dia 18 de fevereiro às 19:00. Tem disponibilidade?"
        },
        {
            data: "2025-02-15",
            hora: "10:00",
            mensagem: "Oi, gostaria de agendar uma aula para o dia 15 de fevereiro às 10:00."
        },
        {
            data: "2025-02-15",
            hora: "10:00",
            mensagem: "Oi, gostaria de agendar uma aula para o dia 15 de fevereiro às 10:00."
        },
    ];

    const [selectedLine, setSelectedLine] = useState();
    const [loading, setLoading] = useState(false);
    const [alunos, setAlunos] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [showDialog, setShowDialog] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [whatsappLog, setWhatsappsLog] = useState(aulasMarcadas);
    const currentPage = Number(searchParams.get("page")) || 1

    const filterSchema = [
        { name: "Nome", parameterName: "name", icon: <UserRound /> },
        { name: "RG", parameterName: "rg", icon: <IdCard /> },
        { name: "CPF", parameterName: "cpf", icon: <IdCard /> },
        { name: "Telefone", parameterName: "phone_number", icon: <Phone /> },
        {
            parameterName: 'Data de Nascimento',
            name: 'birth_date',
            type: 'text',  // Tipo de filtro
            renderCell: (value, setValue) => {
                // Aqui, 'value' seria o valor do filtro atual, passado a partir de seu estado.
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                        <DemoContainer components={["DateField"]}>
                            <DateField
                                value={value ? dayjs(value, "DD-MM-YYYY") : null} // Use o valor passado para 'renderCell'
                                onChange={(e) => {
                                    const formattedDate = e ? e.format("DD-MM-YYYY") : ""; // Formata a data
                                    setValue(formattedDate); // Atualiza o valor do filtro
                                }}
                                className="w-full"
                                label="Digite a data"
                                format="DD/MM/YYYY" // Formato da exibição da data
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                );
            }
        },
    ];

    const columns = [
        { headerName: "#", field: "id" },
        { headerName: "Nome", field: "name" },
        { headerName: "Telefone", field: "phone_number" },
        { headerName: "RG", field: "rg" },
        { headerName: "CPF", field: "cpf" },
        { headerName: "Data de Nascimento", field: "birth_date", },
        { headerName: "Data de Entrada", field: "entry_date", },
        { headerName: "Data de Saída", field: "exit_date", },
        {
            headerName: "Ações",
            field: "acoes",
            renderCell: (params) => (
                <div className="flex justify-center gap-3 ">
                    <Button size="sm" onClick={() => editarAluno(params.row.id)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={() => deletarAluno(params.row.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];



    const fetchAlunos = async (page) => {
        setLoading(true);
        const alunoService = new AlunoService();
        const alunos = await alunoService.alunos(searchParams);
        setAlunos(alunos.data?.students);
        setTotalPage(Math.ceil(alunos.data?.total_records / 10));
        setLoading(false);
    };

    useEffect(() => {
        fetchAlunos(currentPage);
    }, [currentPage]);

    const editarAluno = (id) => {
        router.push(`/admin/alunos/editar/${id}`);
    };

    const deletarAluno = async (id) => {
        setShowDialog(true);
        setConfirmCallback(() => async () => {
            const alunoService = new AlunoService();
            const deletar = await alunoService.deletarAluno(id);
            if (deletar.status == "success") {
                setShowDialog(false);
                fetchAlunos(currentPage);
                return toast({
                    title: "Sucesso",
                    description: deletar.message,
                });

            }

            setShowDialog(false);
            fetchAlunos(currentPage);
            return toast({
                title: "Erro",
                description: deletar.data.details,
                variant: "destructive",
            });
        });
    };

    const handlePageChange = (page) => {
        fetchAlunos(page);
    };
    useEffect(() => {
        fetchAlunos(currentPage);
    }, [currentPage, searchParams]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("page", currentPage);
        router.push(`${window.location.pathname}?${params.toString()}`)
    }, []);

    useEffect(() => {
        console.log(selectedLine)
    }, [selectedLine])








    return (

        <>

            {!!selectedLine && (
                <>
                    <Backdrop onClick={() => setSelectedLine(false)} />
                    <GenericModalContent>
                        <h2>Detalhes do Aluno</h2>
                        <InfoContainer>
                            <InfoItem><span>Nome</span>{selectedLine.name}</InfoItem>
                            <InfoItem><span>Telefone</span>{selectedLine.phone_number}</InfoItem>
                            <InfoItem><span>RG</span>{selectedLine.rg}</InfoItem>
                            <InfoItem><span>CPF</span>{selectedLine.cpf}</InfoItem>
                            <InfoItem><span>Data de nascimento</span>{selectedLine.birth_date}</InfoItem>
                            <InfoItem><span>Data de entrada</span>{selectedLine.entry_date}</InfoItem>
                            <InfoItem><span>Data de saída</span>{selectedLine.exit_date}</InfoItem>
                        </InfoContainer>



                        <ContainerLogs>
                            <h3>📜 Logs de Atividade</h3>
                            {whatsappLog.length > 0 ? (
                                whatsappLog.map((aula, index) => (
                                    <LogContainer key={index}>
                                        <p><strong>Data:</strong> {aula.data}</p>
                                        <p><strong>Hora:</strong> {aula.hora}</p>
                                        <p><strong>Mensagem:</strong> {aula.mensagem}</p>
                                    </LogContainer>
                                ))
                            ) : (
                                <p>Nenhum log encontrado.</p>
                            )}
                        </ContainerLogs>
                    </GenericModalContent>
                </>
            )}

            <div className="container max-w-4xl justify-center items-center mx-auto p-6">
                <AlertDialogUI
                    title="Confirmação de exclusão"
                    description="Deseja realmente deletar este aluno?"
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    onConfirm={confirmCallback}
                />
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="mt-4 text-3xl font-bold">Alunos</h1>
                        <p className="text-muted-foreground">Lista de alunos cadastrados</p>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <FilterModal filterSchema={filterSchema} />
                        <Link className="flex items-center justify-center" href="/admin/alunos/novo">
                            <Button className="px-4">Novo Aluno</Button>
                        </Link>
                    </div>
                </div>
                <div className="mt-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner message="Carregando..." />
                        </div>
                    ) : alunos?.length >= 0 ? (
                        <>
                            <FilterGroup filterSchema={filterSchema} />

                            <Table data={alunos} columns={columns} open={true} setSelectedLine={setSelectedLine} />
                            <div className="mt-4 flex justify-end items-center">
                                <PaginationUI
                                    totalPage={totalPage}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    ) : null
                    }
                </div>
            </div >
        </>


    );
}
