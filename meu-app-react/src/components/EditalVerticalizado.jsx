import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EditalVerticalizado({ concursoSelecionado }) {
    const [itens, setItens] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/edital?concurso=${concursoSelecionado}`)
            .then(response => setItens(response.data))
            .catch(error => console.error("Erro ao carregar edital:", error));
    }, [concursoSelecionado]);

    const alternarItem = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:8080/api/edital/${id}/toggle`);
            setItens(itens.map(item => item.id === id ? response.data : item));
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
        }
    };

    const concluidos = itens.filter(i => i.concluido).length;
    const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold mb-4">Edital Verticalizado - {concursoSelecionado}</h2>
            
            {/* Barra de Progresso */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                    <span>Progresso Geral</span>
                    <span>{progresso}% Concluído</span>
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${progresso}%` }}></div>
                </div>
            </div>

            {/* Lista de Tópicos */}
            <div className="space-y-4">
                {itens.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                            <input 
                                type="checkbox" 
                                checked={item.concluido} 
                                onChange={() => alternarItem(item.id)}
                                className="w-5 h-5 accent-yellow-500 cursor-pointer"
                            />
                            <span className={item.concluido ? "line-through text-gray-400" : "text-gray-100"}>
                                {item.topico}
                            </span>
                        </div>
                        <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                            item.incidencia === 'Alta' ? 'bg-red-900 text-red-300' :
                            item.incidencia === 'Média' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                        }`}>
                            Incidência {item.incidencia}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}