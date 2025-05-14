export default class RespostaPergunta {
    id: string = ''
    idAnamneseResposta: string = ''
    idModeloPergunta: string = ''
    resposta: string = ''

    
    constructor(
        id: string,
        idAnamneseResposta: string,
        idModeloPergunta: string,
        resposta: string
    ) {
        this.id = id
        this.idAnamneseResposta = idAnamneseResposta
        this.idModeloPergunta = idModeloPergunta
        this.resposta = resposta
    }
}