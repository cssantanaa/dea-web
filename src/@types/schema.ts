import { Timestamp } from "firebase/firestore";

export type TipoUsuario = "super_admin" | "admin" | "socorrista";

export interface Usuario {
    uid: string;
    nome: string;
    usuario: string; //login único
    tipo: TipoUsuario;
    estabelecimentoId: string;
    telefone_sms: string;
    status: "ativo" | "inativo";
}

export interface ClienteOrganizador {
    id: string;
    nome: string;
    documento: string;
}

export interface Estabelecimento {
    id: string;
    clienteId: string;
    nome: string;
    cnpj: string;
    tipoOperacao: "permanente" | "evento";
    dataInicio?: Timestamp; //apenas para tipoOperacao "evento"
    dataFim?: Timestamp; //apenas para tipoOperacao "evento"
    categoria: "Shopping" | "Faculdade" | "Hospital" | "Estádio" | "Outros";
    categoriaOutros?: string; 
    endereco: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
    };
    capacidade: number;
    statusMapa: "pendente" | "em-configuracao" | "publicado";
    status: "rascunho" | "ativo" | "inativo" | "encerrado";
}