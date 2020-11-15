let last_move= null;

//---------------------------------------------------------------------состояние игровой доски
class Board{
    constructor() {
        this.houses = [
            3,3,3,3,3,3,0,
            3,3,3,3,3,3,0
        ];

        this.stones_to_undo = [];
        this.player_to_undo = null;
        this.undo_player_stones = null;
    }
    get_stones(house_numb){
        return this.houses[house_numb];
    }
    copy_state(board){
        for(let i = 0; i<14;i++){
            this.houses[i]=board[i];
        }
    }
    make_move(n_of_stones,kalah, player){
        let plus_houses = get_next_houses_to_put_stones(n_of_stones,kalah,player);
        for(let i = 0; i<14;i++){
            this.houses[i]+=plus_houses[i];
        }
        this.houses[kalah]=0;
    }
    undo_move(n_of_stones,kalah, player){
        let plus_houses = get_next_houses_to_put_stones(n_of_stones,kalah,player);
        for(let i = 0; i<14;i++){
            this.houses[i]-=plus_houses[i];
        }
        this.houses[kalah]=n_of_stones;
    }
    check_kalah_for_zero(player_to_check_void){
        let i = 0, a = 6;
        if(player_to_check_void === 0){
            i = 7;
            a = 13;
        }
        for(i;i<a;i++){
            if (this.houses[i] !== 0) return false;
        }
        return true
    }
    put_left_stones(player){
        this.player_to_undo = player;
        let i = 0, a=6, op = 13;
        if(player === 0){
            i = 7;
            a = 13;
            op = 6;
        }
        for(i;i<a;i++){
            this.stones_to_undo.push(this.houses[i]);
            this.houses[i]=0;
        }
        this.undo_player_stones = this.houses[a];
        this.houses[a]= 36 - this.houses[op];
    }
    put_left_stones_back(player){
        let a=6;
        if(player === 0){
            a = 13;
            for(let i = 0; i<6; i++){
                this.houses[i+7] = this.stones_to_undo[i];
            }

        }else{
            for(let i = 0; i<6; i++){
                this.houses[i] = this.stones_to_undo[i];
            }
        }
        this.houses[a]= this.undo_player_stones;
        this.player_to_undo = null;
        this.undo_player_stones = null;
        this.stones_to_undo = [];
    }
    get_winner(){
        if(this.houses[6]===this.houses[13])return 2;
        if(this.houses[6]>this.houses[13])return 1;
        return 0;
    }
}


let our_board = new Board();

//---------------------------------------------------------------------обработка хода игрока
function make_move(idd){

    idd = Number(idd);
    let chosen_stones = our_board.get_stones(idd);

    if(chosen_stones!== 0){

        our_board.make_move(chosen_stones, idd, 1);
        update_board();

       check_if_the_game_is_over(0);
        if(last_move === 6 ){
            check_if_the_game_is_over(2);
            return;
        }


        let output = document.getElementById("who");                                                 //как-то красиво сделай
        output.innerText = " ";

        ai_make_move();

        while(last_move===13){
            ai_make_move();
            if(check_if_the_game_is_over(2)) return;
        }

        if(check_if_the_game_is_over(2)) return;
    }
}

function check_if_the_game_is_over(player){
    if(player===2){
        if(our_board.check_kalah_for_zero(0)){
            if_game_is_over(1);
            return true;
        } if(our_board.check_kalah_for_zero(1)){
            if_game_is_over(0);
            return true;
        }
    }else{
        if(our_board.check_kalah_for_zero(player)){
            if_game_is_over(1-player);
            return true;
        }
    }
    return false;
}

function if_game_is_over(who_moved_last){
    our_board.put_left_stones(who_moved_last);
    update_board();
    let winner = our_board.get_winner();
    game_over(winner);

}

function game_over(player_win){
    if(player_win===1)alert("Game over!\nYou won");
    else if(player_win===0) alert("Game over!\nYou lose");
    else alert("Game over!");

    let show = document.getElementById("g_over");
    show.innerText = "Game over!"
    show.style.backgroundColor = "#ac90b86e";

}

function ai_make_move(){
    let ai_player = new Ai_player();
    ai_player.make_move_alpha_beta();

    our_board.make_move(our_board.get_stones(ai_player.kalah_move), ai_player.kalah_move,0);
    update_board();

    let output = document.getElementById("who");
    if(ai_player.kalah_move!==null)output.innerText += " "+ai_player.kalah_move;
}


function get_next_houses_to_put_stones(n_stones, house_index, player){
    let houses = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    let forbidden_kalah = 6;
    if(player === 1) forbidden_kalah = 13;

    for(let i = 1; i<=n_stones;i++){
        let plus = i+house_index;
        if(plus !== forbidden_kalah){
            if(plus<14){
                houses[plus]+=1;
                last_move = plus;
            }
            else{
                plus-=14;
                houses[plus]+=1;
                last_move = plus;
            }
        }else{
            n_stones++;
        }
    }
    return houses;
}

function update_board(){
    for(let i = 0; i<14;i++){
        let board_house = document.getElementById(String(i));
        let house_numb = Number(board_house.textContent);
        let board_numb = our_board.get_stones(i);
        if(house_numb !== board_numb){
            board_house.textContent = String(board_numb);
        }
    }
}


//---------------------------------------------------------------------ход компьютера

class Ai_player{
    constructor() {
        this.put_value = true;
        this.values_for_move = [null,null,null,null,null,null];

        this.kalah_move = null;
        this.imitate_board = new Board();
        this.imitate_board.copy_state(our_board.houses);

    }
    choose_best_move(){
        let best = -1;
        let move;
        for(let i = 0;i<7;i++){
            if((this.values_for_move[i]!== null)&&(this.values_for_move[i]>best)){
                move = i+7;
                best = this.values_for_move[i];
            }
        }
        return move;
    }
    make_move_alpha_beta(){
        this.minmax_Maximize(-Infinity, Infinity, 0, null );
    }
    minmax_Maximize(alpha, beta,  counter_depth, move ){
        if(this.imitate_board.check_kalah_for_zero(0)){
            this.imitate_board.put_left_stones(1);
            return (this.imitate_board.get_stones(13));
        }
        if(counter_depth === 10) return this.find_approximate_value(1,alpha,beta, move);

        let value = -Infinity;
        for(let i = 7; i <= 12; i++){
            if(this.imitate_board.get_stones(i)!== 0){
                let stones = this.imitate_board.get_stones(i);
                this.imitate_board.make_move(this.imitate_board.get_stones(i),i,0);

                let found_value;
                if(last_move === 13) found_value = this.minmax_Maximize(alpha, beta,counter_depth+1, i);
                else found_value = this.minmax_Minimize(alpha, beta,counter_depth+1, i);
                value = Math.max(value, found_value);

                if(counter_depth === 0){
                    this.values_for_move[i-7]=found_value;
                }

                if(this.imitate_board.player_to_undo!== null){
                    this.imitate_board.put_left_stones_back(this.imitate_board.player_to_undo);
                }
                this.imitate_board.undo_move(stones,i,0);

                if((value >= beta)) return value;

                if(value>alpha){
                    if(counter_depth === 0){
                        this.kalah_move = i;
                    }
                    alpha=value;
                }                                //придумать как сделать определение хода
                //alpha = Math.max(alpha,value);
            }
        }
        return value;
    }
    minmax_Minimize(alpha, beta, counter_depth, move){
        if(this.imitate_board.check_kalah_for_zero(1)){
            this.imitate_board.put_left_stones(0);
            return this.imitate_board.get_stones(13);
        }
        if(counter_depth === 10) return this.find_approximate_value(0, alpha,beta, move);

        let value = Infinity;
        for(let i = 0; i<= 5; i++){
            if(this.imitate_board.get_stones(i)!== 0){
                let stones = this.imitate_board.get_stones(i);
                this.imitate_board.make_move(stones,i,1);

                let found_value;
                if(last_move === 6) found_value = this.minmax_Minimize(alpha, beta,counter_depth+1, i);
                else found_value = this.minmax_Maximize(alpha, beta,counter_depth+1, i)
                value = Math.min(value, found_value);

                if(this.imitate_board.player_to_undo!== null){
                    this.imitate_board.put_left_stones_back(this.imitate_board.player_to_undo);
                }
                this.imitate_board.undo_move(stones,i,1);

                if (value <= alpha ) return value;
                beta = Math.min(beta,value);
            }
        }
        return value;
    }

    find_approximate_value(player, alpha, beta){
        let coef = 36/(this.imitate_board.houses[13]+this.imitate_board.houses[6]);
        return (this.imitate_board.houses[13]*coef);
    }
}











