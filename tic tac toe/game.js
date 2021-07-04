function init(player,OPPONENT)
{
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");

    let board = [];
    const COLUMN = 3;
    const ROW = 3;
    const SPACE_SIZE = 150;

    let GAME_OVER = false;

    //store players name

    let gameData = new Array(9);
   
    let currentPlayer = player.man;

    //load X and O images
    const xImage = new Image();
    xImage.src = "img/X.png"; 

    const oImage = new Image();
    oImage.src = "img/O.png"; 

    //win combinations
    const COMBOS = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    function drawBoard()
    {
        //we link our game data to every space
        let id=0;
        for(let i=0;i< ROW;i++)
        {
            board[i] = [];
            for(let j=0;j<COLUMN;j++)
            {
                board[i][j] = id;
                id++;
                ctx.strokeStyle = "#000";
                ctx.strokeRect(j*SPACE_SIZE,i*SPACE_SIZE,SPACE_SIZE,SPACE_SIZE);
            }
        }
    }
    drawBoard();

    //on players click
    canvas.addEventListener('click',function(event){

        if(GAME_OVER)
        {
            return;
        }
        //x and y position relative to the canvas
        let X = event.clientX - canvas.getBoundingClientRect().x;
        let Y = event.clientY - canvas.getBoundingClientRect().y;

        //we calcuate i and j of clicked space 

        let i = Math.floor(Y/SPACE_SIZE);
        let j = Math.floor(X/SPACE_SIZE);

        let id = board[i][j];

        //prevent the player to play same space twice
        if(gameData[id])
        {
            return;
        }
        gameData[id] = currentPlayer;

        //draw the move on the board
        drawOnBoard(currentPlayer,i,j);

        if(isWinner(gameData,currentPlayer))
        {
            showGameOver(currentPlayer);
            GAME_OVER = true;
            return;
        }
        if(isTie(gameData))
        {
            showGameOver("tie");
            GAME_OVER = true;
            return;
        }

        if(OPPONENT == "computer")
        {

            //get id using minimax algorithm
            let id = minimax(gameData,player.computer).id;
        //prevent the player to play same space twice
        if(gameData[id])
        {
            return;
        }
        gameData[id] = player.computer;
        //get i and j of space
        let space = getIJ(id);

        //draw the move on the board
        drawOnBoard(player.computer,space.i,space.j);

        if(isWinner(gameData,player.computer))
        {
            showGameOver(player.computer);
            GAME_OVER = true;
            return;
        }
        if(isTie(gameData))
        {
            showGameOver("tie");
            GAME_OVER = true;
            return;
        }
        }
        else
        {
           currentPlayer = currentPlayer == player.man ? player.friend : player.man;
        }
    });

    //minimax function
    function minimax(gameData,PLAYER)
    {
       if(isWinner(gameData,player.computer))
       {
           return{
               evaluation : 10
           };
       }
       if(isWinner(gameData,player.man))
       {
           return{
               evaluation : -10
           };
       }
       if(isTie(gameData))
       {
           return{
               evaluation : 0
           };
       }
       //look for empty spaces
       let EMPTY_SPACES = getEmptySpaces(gameData);
       let moves = [];

       for(let i=0;i<EMPTY_SPACES.length;i++)
       {
           let id = EMPTY_SPACES[i];
           let backup = gameData[id];
           gameData[id] = PLAYER;
           let move = {};
           move.id = id;
           if(PLAYER == player.computer)
           {
               move.evaluation = minimax(gameData,player.man).evaluation;
           } 
           else
           {
               move.evaluation = minimax(gameData,player.computer).evaluation;
           }
           gameData[id] = backup;
           moves.push(move);
       }
       let bestMove;
       if(PLAYER == player.computer)
       {
           let bestEvaluation = -Infinity;
           for(let i=0;i<moves.length;i++)
           {
               if(moves[i].evaluation > bestEvaluation)
               {
                   bestEvaluation = moves[i].evaluation;
                   bestMove = moves[i]; 
               }
           }
       }
       else
       {
        let bestEvaluation = +Infinity;
        for(let i=0;i<moves.length;i++)
        {
            if(moves[i].evaluation < bestEvaluation)
            {
                bestEvaluation = moves[i].evaluation;
                bestMove = moves[i]; 
            }
        }
       }
       return bestMove;
    }

    //get empty spaces
    function getEmptySpaces(gameData)
    {
        let EMPTY = [];
        for(let i=0;i<gameData.length;i++)
        {
            if(!gameData[i])
            {
                EMPTY.push(i);
            }
        }
        return EMPTY;
    }
    //get i and j of space
    function getIJ(id)
    {
        for(let i=0;i<board.length;i++)
        {
            for(let j=0;j<board[i].length;j++)
            {
                if(board[i][j] == id)
                {
                    return {
                        i : i,
                        j : j
                    }
                }
            }
        }
    }

    //check for a winner 
    function isWinner(gameData,Player)
    {
        for(let i=0;i<COMBOS.length;i++)
        {
            let won = true;
            for(let j=0;j<COMBOS[i].length;j++)
            {
                let id = COMBOS[i][j];
                won = gameData[id] == Player && won;
            }
            if(won)
            {
                return true;
            }
        }
        return false;
    }
    //check for a tie
    function isTie(gameData)
    {
        let isBoardFill = true;
        for(let i=0;i< gameData.length;i++)
        {
            isBoardFill = gameData[i] && isBoardFill;
        }
        if(isBoardFill)
        {
            return true;
        }
        return false;
    }
     // show game over
    function showGameOver(player)
    {
        console.log("hey game is over");
        let message = player == "tie" ? "Oops no Winner" : "The Winner is";
        let imgSrc = `img/${player}.png`;

        gameOverElement.innerHTML = `
          <h1>${message}</h1>
          <img class="winner-img" src=${imgSrc}></img>
          <div class="play" onClick="location.reload()">Play Again</div>
        `;
        gameOverElement.classList.remove("hide");
    }
    function drawOnBoard(player,i,j)
    {
      let img = player=="X" ? xImage:oImage;
      ctx.drawImage(img,j*SPACE_SIZE,i*SPACE_SIZE);
    }
 }