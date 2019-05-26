import React,{Component} from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const windowWidth = document.documentElement.clientWidth
const windowHeight = document.documentElement.clientHeight

class Toolkit {
    static get matrix(){
        const obj = {
            makeRow:(v=0)=>{
                return new Array(9).fill(v)
            },
            makeMatrix:(v=0)=>{
                return Array.from({
                    length: 9
                }, () => obj.makeRow(v))
            },
            shuffleArray(arr){
                for(let i=0;i<arr.length;i++){
                    const randomIndex = Math.floor(Math.random() * (i + 1));
                    [arr[i],arr[randomIndex]] = [arr[randomIndex],arr[i]]
                }
                return arr
            },
            checkFillable(matrix,n,rowIndex,colIndex){
                const row = matrix[rowIndex]
                const column = obj.makeRow().map((v,i)=>matrix[i][colIndex])
                const {boxIndex} = Toolkit.box.convertToBoxIndex(rowIndex,colIndex)
                const box = Toolkit.box.getBoxCells(matrix,boxIndex)
                for(let i=0;i<9;i++){
                    if(row[i] === n || column[i]===n || box[i] === n){
                        return false
                    }
                }
                return true
            },
          transferMatrix(matrix){
                return matrix.map(row=>row.map(cell=>{
                    return {
                        value:cell,
                        state:cell==0?0:1
                    }
                }))
          }
        }
        return obj
    }
    static get box(){
        const obj = {
            convertToBoxIndex(rowIndex,colIndex){
                return {
                    boxIndex:Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3),
                    cellIndex:rowIndex % 3 * 3 + colIndex % 3
                }
            },
            convertFromBoxIndex(boxIndex,cellIndex){
                return {
                    rowIndex:Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
                    colIndex:boxIndex % 3 * 3 + colIndex % 3
                }
            },
            getBoxCells(matrix,boxIndex){
                const startRowIndex = Math.floor(boxIndex / 3) * 3
                const startColIndex = boxIndex % 3 * 3
                const result = []
                for(let i = 0;i < 9;i++){
                    const rowIndex = startRowIndex + Math.floor(i/3)
                    const colIndex = startColIndex + i % 3
                    result.push(matrix[rowIndex][colIndex])
                }
                return result
            }
        }
        return obj
    }
}

class Checker{
    constructor(matrix){
        this._matrix = matrix
        this._matrixMarks = Toolkit.matrix.makeMatrix(true)
    }
    get matrixMarks(){
        return this._matrixMarks
    }
    check(){
        this.checkRows()
        this.checkCols()
        this.checkBoxes()
        return this._matrixMarks.every(row=>row.every(mark=>mark))
    }
    checkRows(){
        this._matrix.forEach((row,idx)=>{
            const marks = this.checkArray(row)
            for(let colIndex=0;colIndex<marks.length;colIndex++){
                if(!marks[colIndex]){
                    this._matrixMarks[idx][colIndex] = false
                }
            }
        })
    }
    checkCols(){
        for(let colIndex = 0;colIndex < 9;colIndex++){
            const cols = []
            for(let rowIndex = 0;rowIndex<9;rowIndex++){
                cols[rowIndex] = this._matrix[rowIndex][colIndex]
            }
            const marks = this.checkArray(cols)
            for(let rowIndex = 0;rowIndex<marks.length;rowIndex++){
                if(!marks[rowIndex]){
                    this._matrixMarks[rowIndex][colIndex] = false
                }
            }
        }
    }
    checkBoxes(){
        for(let boxIndex = 0;boxIndex<9;boxIndex++){
            const boxes = Toolkit.box.getBoxCells(this._matrix,boxIndex)
            const marks = this.checkArray(boxes)
            for(let cellIndex = 0;cellIndex<9;cellIndex++){
                if(!marks[cellIndex]){
                    const {rowIndex,colIndex} = Toolkit.box.convertFromBoxIndex(boxIndex,cellIndex)
                    this._matrixMarks[rowIndex][colIndex] = false
                }
            }
        }
    }
    checkArray(array){
        const length = array.length
        const marks = new Array(length)
        marks.fill(true)
        for(let i=0;i<length-1;i++){
            if(!marks[i]) continue
            const v = array[i]
            //是否有效 0-无效
            if(!v){
                marks[i] = false
                continue
            }
            for(let j=i+1;j<length;j++){
                if(v === array[j]){
                    marks[i] = marks[j] = false
                }
            }
            //是否重复 i+1 - 9 是否和i位置重复
        }
        return marks
    }
}

class Generator{
    generate(){
        // this.internalGenerate()
        // return
        let  count = 0
        while(!this.internalGenerate()){
            console.warn('try again,times: ',++count)
        }
    }
    internalGenerate(){
        this.matrix = Toolkit.matrix.makeMatrix()
        this.orders = Toolkit.matrix.makeMatrix().map(row=>row.map((v,i)=>i)).map(row=>Toolkit.matrix.shuffleArray(row))
        for(let i=1;i<=9;i++){
            if(!this.fillNumber(i)){
                return false
            }
        }
        return true
    }
    fillNumber(n){
        return this.fillRow(n,0)
    }
    fillRow(n,rowIndex){
        if(rowIndex > 8) return true
        const row = this.matrix[rowIndex]
        const orders = this.orders[rowIndex]
        for(let i=0;i<9;i++){
            const colIndex = orders[i]
            if(row[colIndex]){
                continue
            }
            if(!Toolkit.matrix.checkFillable(this.matrix,n,rowIndex,colIndex)){
                continue
            }
            row[colIndex] = n
            if(!this.fillRow(n,rowIndex+1)){
                row[colIndex] = 0
                continue
            }
            return true
        }
        return false
    }
}

class Sudoku{
    constructor(matrix){
        this.solutionMatrix = matrix
    }
    make(level = 5){
        return this.solutionMatrix.map(row=>row.map(cell=>{
            return Math.random() * 9 < level? 0 : cell
        }))
    }
}

class Grid extends Component {
    constructor(){
        super()
        this.span = React.createRef()
        const generator = new Generator()
			  generator.generate()
        const matrix = Toolkit.matrix.transferMatrix(new Sudoku(generator.matrix).make())
        this.matrix_origin = JSON.parse(JSON.stringify(matrix))
        console.log('this.matrix_origin',this.matrix_origin)
        this.matrix_initial = JSON.parse(JSON.stringify(Toolkit.matrix.transferMatrix(generator.matrix)))
        this.state = {
            popUpShow:false,
            offset:{left:0,top:0},
            spanOffset:{},
					  matrix:matrix
        }
        document.addEventListener('click',e=>{
            if(!e.target.classList.contains('col-span')){
                this.setState({
                    popUpShow:false
                })
            }
        })
    }
    layout(){
        const width = this.span.current.clientWidth
        const spans = document.querySelectorAll('span')
        for(let item of spans){
            item.style.lineHeight = width+'px'
            item.style.height = width+'px'
            item.style.fontSize = width<32?`${width / 2}px`:''
        }
    }
    spanClick(e){
        if(e.target.classList.contains('state1')) {
            if(this.state.popUpShow){
							this.setState({
								popUpShow:false
							})
            }
            return
        }
        const offset = e.target.getAttribute('offset').split(',')
        const spanOffset = {
            x:offset[0],
            y:offset[1]
        }
        const rect = e.target.getBoundingClientRect()
        let {left,top} = rect
        if(left + 100 > windowWidth){
            left = windowWidth - 200
        } else if(left - 100 < 0){
            left = 0
        }else {
            left = left - 100
        }
        top = top + this.span.current.clientHeight + 5
        this.setState({
            offset:{left,top},
            popUpShow:true,
            spanOffset:spanOffset
        })
    }
	  transferMsg(msg){
        // state 0-初始值0 1-已显示的初始化不为0值 2-后填写的值 3-错误状态
        this.setState((old)=>{
					old.matrix[old.spanOffset.x][old.spanOffset.y].value = msg?msg:0
					old.matrix[old.spanOffset.x][old.spanOffset.y].state = msg?2:0
          return old
        })
    }
	  checkOut(){
        let matrix = this.state.matrix
        for(let i=0;i<this.matrix_initial.length;i++){
            for(let j=0;j<this.matrix_initial[i].length;j++){
                if(matrix[i][j].value != this.matrix_initial[i][j].value){
									matrix[i][j].state = 3
                }
            }
        }
        this.setState({
					matrix
        })
    }
	  reset(){
			this.setState({
				matrix:JSON.parse(JSON.stringify(this.matrix_origin))
			})
    }
	  rebuild(){
			const generator = new Generator()
			generator.generate()
			const matrix = Toolkit.matrix.transferMatrix(new Sudoku(generator.matrix).make())
			this.matrix_origin = JSON.parse(JSON.stringify(matrix))
			this.matrix_initial = JSON.parse(JSON.stringify(Toolkit.matrix.transferMatrix(generator.matrix)))
      this.setState({
				popUpShow:false,
				matrix:matrix
      })
    }
    componentDidMount(){
        this.layout()
    }
    render(){
			const rowGroupClasses = ['row_g_top','row_g_middle','row_g_bottom']
			const colGroupClasses = ['col_g_left','col_g_center','col_g_right']
			const  $divArray = this.state.matrix.map(($spanArray,index)=>{
				return (
					<div key={index} className={classNames('row',rowGroupClasses[index % 3])}>
						{$spanArray.map((cellValue,idx)=>{
							return <span key={idx} offset={index+','+idx} className={classNames(colGroupClasses[idx % 3],`state${cellValue.state}`,'col-span',{redColor:cellValue.state==3&&cellValue.value==0})} ref={this.span} onClick={this.spanClick.bind(this)}>{cellValue.value}</span>
						})}
					</div>
				)
			})
        return (
            <React.Fragment>
                {$divArray.map(ele=>ele)}
                <PopupNumberBox popUpShow={this.state.popUpShow} offset={this.state.offset} spanOffset={this.state.spanOffset} transferMsg={msg=>this.transferMsg(msg)}></PopupNumberBox>
							<div id="dashboard" className="dashboard">
								<div className="buttons">
									<button id="check" type="button" onClick={()=>this.checkOut()}>检查</button>
									<button id="reset" type="button" onClick={()=>this.reset()}>重置</button>
									<button id="clear" type="button" onClick={()=>this.reset()}>清理</button>
									<button id="rebuild" type="button" onClick={()=>{this.rebuild()}}>重建</button>
								</div>
							</div>
            </React.Fragment>
        )
    }
}

function PopupNumberBox(props){
    const arr = new Array(3).fill(new Array(3).fill(0)).map((ele,index)=>ele.map((cell,idx)=>{
        return index * 3 + idx+1
    }))
	  function clickPanel(e){
        props.transferMsg(e.target.innerHTML)
    }
    return (
        <div className={classNames("grid popup-num",{hidden:!props.popUpShow})} id="popupNumbers" style={{top:props.offset.top+'px',left:props.offset.left+'px'}}>
            {arr.map(row=>{
                return <div className="row" key={row} onClick={clickPanel}>
                    {row.map(col=><span key={col}>{col}</span>)}
                </div>
            })}
            <div className="row" onClick={clickPanel}>
                <span className="mark1"></span>
                <span></span>
                <span className="mark2"></span>
            </div>
        </div>
    )
}

ReactDOM.render(<Grid />,document.querySelector('#container'))
