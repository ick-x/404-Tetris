function generate_random_list_matrix(mini,maxi,nb_line,nb_column){
    let matrix = [];
    for(let l=0;l<nb_line;l++){
        let line= [];
        for(let c=0;c<nb_column;c++){
            line.push(Math.random() * (maxi - mini) + mini);
        }
        matrix.push(line);
    }
    return matrix;
}

function generate_random_neural_network(nb_inputs, nb_layer, nb_neurons, nb_outputs){
    let weight_matrice = [generate_random_list_matrix(-1,1,nb_neurons,nb_inputs)];
    for(let i=0; i<nb_layer;++i){
        weight_matrice.push(generate_random_list_matrix(-1,1,nb_neurons,nb_inputs));
    } 
    weight_matrice.push(generate_random_list_matrix(-1,1,nb_outputs,nb_inputs));
    let bias_matrix=[];
    for(let i=0; i<=nb_layer;++i){
        bias_matrix.push(generate_random_list_matrix(-1,1,nb_neurons,1));
    }
    bias_matrix.push(generate_random_list_matrix(-1,1,nb_outputs,1));
    return {weight:weight_matrice, bias:bias_matrix};
}