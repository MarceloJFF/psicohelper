export default class AnamneseResposta {
    id: string
    idModeloAnamnese: string
    idResponsavel: string
    idProfissional: string
    idAprendente: string

    constructor(
        id: string,
        idModeloAnamnese: string,
        idResponsavel: string,
        idProfissional: string,
        idAprendente: string
    ) {
        this.id = id
        this.idModeloAnamnese = idModeloAnamnese
        this.idResponsavel = idResponsavel
        this.idProfissional = idProfissional
        this.idAprendente = idAprendente
    }
}