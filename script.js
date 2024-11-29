
const ctx = document.getElementById('canvas-el').getContext('2d')

document.body.style.backgroundColor = 'black'

function grid(intervalx, intervaly, style) {

    ctx.beginPath()
    ctx.strokeStyle = style || 'gray'

    for (var i = intervalx; i <= intervalx * (ctx.canvas.width / intervalx); i+=intervalx) {
        ctx.moveTo(i, 0)
        ctx.lineTo(i, ctx.canvas.height)
        ctx.stroke()
    }

    for (var i = intervaly; i <= intervaly * (ctx.canvas.height  / intervaly); i+=intervaly) {
        ctx.moveTo(0, i)
        ctx.lineTo(ctx.canvas.width, i)
        ctx.stroke()
    }

    ctx.closePath()
}

var GLOBAL_ID = 1

function hLine(y, style) {
    // horizontal line
    ctx.beginPath()
    ctx.strokeStyle = style || 'blue'
    ctx.moveTo(0, y)
    ctx.lineTo(ctx.canvas.width, y)
    ctx.stroke()

    ctx.closePath()

}

function vLine(x, style)  {
    // vertical line
    ctx.beginPath()
    ctx.strokeStyle = style || 'blue'
    ctx.moveTo(x , 0)
    ctx.lineTo(x, ctx.canvas.height)
    ctx.stroke()
    ctx.closePath()
}

function linear(m, x, b) {
    return m * x + b
}

function constants(obj, obj2) {
    var slp = (obj2.y - obj.y) / (obj2.x - obj.x)
    var c = obj2.y - slp * obj2.x
    if (slp == Infinity || slp == -Infinity || c == Infinity || c == -Infinity) {
        obj2.x = obj2.x - 0.1
        return constants(obj, obj2)
    }
    return [slp, c]
}

function intersection(line1, line2, P, name, style)  { // line1, line2 = [slp, c] return of constants()
    x = (line1[1] - line2[1]) / (line2[0] - line1[0])
    y = line1[0] * x + line1[1]

    if (name) {
        var i = new Point(x, y)
        i.setAttri('name', name)
        i.setAttri('name-style', style || 'orange')
        i.render()
    }
    
    if (P) {return new Point(x, y)}
    return [x, y]
}

function distance(obj, obj2) {
    return Math.sqrt((obj.x - obj2.x)**2 + (obj.y - obj2.y)**2)
}

function rad(degree) {
    return degree / 57.3
}

class Point{
    x;
    y;
    attri = {'name':null, 'type':null, 'name-visible':0, 'name-style':null, 'line-style':null, 'chain-render':null, 'id':null, 'live':0}
    // chain-render --> any obj in outgoing_node will get render
    Incoming_node = []
    Outgoing_node = []
    repeat = []
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.attri.id = GLOBAL_ID
        GLOBAL_ID += 1
    }

    setAttri(key, val) {
        this.key = key
        if (this.attri.hasOwnProperty(this.key)) {
            this.attri[this.key] = val
            if (this.key == 'name') {
                this.attri['name-visible'] = 1
            }
            return 1
                }
    }

    addInNode(obj) {
        this.Incoming_node.push(obj)
        return 1
    }
    addOutNode(obj) {
        obj.addInNode(this)
        this.Outgoing_node.push(obj)
        return 1
    }

    htl(style) {
        // horizontal line
        hLine(this.y, style || this.attri["line-style"])
    }

    vtl(style) {
        // vertical line
        vLine(this.x, style || this.attri["line-style"])
    }

    self_const(obj) {
        return constants(this, obj)
    }

    self_distance(obj) {
        return distance(this, obj)
    }

    self_line(obj, style) {
        ctx.beginPath()
        ctx.strokeStyle = style || this.attri["line-style"] || 'white'
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(obj.x, obj.y)
        ctx.stroke()
        ctx.closePath()
        return [this, obj]
    }

    render() {
        if (this.attri["name-visible"])  {
            var nStyle = this.attri["name-style"] || 'white'
            ctx.fillStyle = nStyle
            ctx.fillText(this.attri.name, this.x, this.y, 100)
        }

        if (this.Outgoing_node.length > 0) {
            for (var i = 0; i < this.Outgoing_node.length; i++) {
                
                var cur_id = this.Outgoing_node[i].attri.id
                
                if (this.repeat.includes(cur_id)) {
                    continue
                }

                if (this.attri["chain-render"]) {
                    this.Outgoing_node[i].render()
                }

                ctx.beginPath()
                ctx.strokeStyle = this.attri["line-style"] || 'white'
                ctx.moveTo(this.x, this.y)
                ctx.lineTo(this.Outgoing_node[i].x, this.Outgoing_node[i].y)
                ctx.stroke()
                ctx.closePath()

                this.repeat.push(cur_id)
            }
        }


        return 1
    }

    h(length, direction, r, dev, style) {
        // direction --> 1 left, 0 right
        // it will use the point of intersection of line of vision and stationP
        // (stationP.x, cv.y)

        

        var ref = new Point(stationP.x, cv.y)
        ref.setAttri('name', 'ref')
        var c = ref.self_const(this)

        var zeroPoint = intersection(c, [0, ml.y])

        if (direction) {
            var n = new Point(zeroPoint[0] - length, ml.y)
        } else {
        var n = new Point(zeroPoint[0] + length, ml.y)
        }
        if (dev)
        {ref.addOutNode(this)
        ref.addOutNode(n)
        ref.addOutNode(new Point(zeroPoint[0], zeroPoint[1]))
        ref.render()}

        var foo = intersection(ref.self_const(n), [0, this.y]) // [0, this.y] is horizontal line
        // and this line intersects the lines from ref to n,
        
        if (r) {
            this.self_line(new Point(foo[0], foo[1]), style || this.attri["line-style"] || 'white')
            // this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }

    }

    Hline(length, direction, r, true_length, dev, limitLine, style) {
        // if (limitLine) and if length is more than enough to exceed the limitLine, it will stop
        // if length < 0, it will, go until limitLine
        // limitLine --> [slp, c] --> return value of constants()

        if (true_length) {
            if (direction) {
                // left
                var foo = new Point(this.x - length, this.y)
            } else {
                // right
                var foo = new Point(this.x + length, this.y)
            }
            if (r) {
                this.self_line(foo)
                if (dev) {
                    console.info(`[Hline] [${this.x}, ${this.y}], there is nothing to (dev) if (true_length).`)
                }
            }
            if (limitLine) {
                console.info(`[Vline] [${this.x}, ${this.y}], (limitLine) will be overshadowed by (true_length).`)
            }
            return [this, foo]
        }

        if (limitLine) {
            let ints = intersection([0, this.y], limitLine, 1)

            if (direction) {
                // console.info(this.y, ints.y)
                if (ints.x > this.x) {
                    // it is going to right but direction --> 1 is left, in this case just go length in left direction
                    let f = this.h(length, direction, r, dev, style); 
                    console.warn(`Warning, [Hline] [${this.attri.name}][${this.x},${this.y}]'s horizontal line does not intersect with the point[${ints.x}, ${ints.y}] because of opposite direction. Input: left`)
                    return f
                } else {
                    if (r)
                    {this.self_line(ints)}
                    return [this,ints]
                }
            } else {
                // this is direction -- 0, right
                if (ints.x > this.x) {
                    // right
                    if (r)
                    {this.self_line(ints)}
                    return [this,ints]
                } else {
                    let f =this.h(length, direction, r, dev, style); 
                    console.warn(`Warning, [Hline] [${this.attri.name}][${this.x},${this.y}]'s horizontal line does not intersect with the point[${ints.x}, ${ints.y}] because of opposite direction. Input: right`)
                    return f
                }
            }

        } else {
            let f = this.h(length, direction, r, dev, style);
            return f
        }
    }

    vertical(length, direction, r, dev, style) {
        // direction --> 1 up, 0 down
        // it will use the point of intersection of line of vision and stationP
        // (stationP.x, cv.y)   
        var ref = new Point(stationP.x, cv.y)
        ref.setAttri('name', 'ref')
        var c = ref.self_const(this)

        var zero = intersection(c, [0, ml.y])
        var zPoint = new Point(zero[0], zero[1])

        if (direction) {
            var n = new Point(zero[0], zero[1] - length)
        } else {
            var n = new Point(zero[0], zero[1] + length)
        }

        var foo = intersection(ref.self_const(n),  this.self_const(new Point(this.x, 0))) // [this.x, 0] vertical line
        // intersect with ref and n

        if (dev)
        {zPoint.vtl()
        ref.addOutNode(zPoint)
        ref.addOutNode(n)
        ref.render()}

        if (r) {
            this.self_line(new Point(foo[0], foo[1]), style || this.attri["line-style"] || 'white')
            // this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            // this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }
    }

    Vline(length, direction, r, true_length, dev, limitLine, style) {

        if (true_length) {
            // no foreshortening, no measuring on measuringline
            if (direction) { // up 
                var foo = new Point(this.x, this.y - length)
            } else { // down
                var foo = new Point(this.x, this.y + length)
            }

            if (r)
            {
                this.self_line(foo,  this.attri["line-style"])
                if (dev) {
                    console.info(`[Vline] [${this.x}, ${this.y}],there is nothing to (dev) if (true_length).`)
                }
            }
            if (limitLine) {
                console.info(`[Vline] [${this.x}, ${this.y}], (limitLine) will be overshadowed by (true_length).`)
            }
            return [this, foo]
        }

        if (limitLine) {
            let ints = intersection(this.self_const(new Point(this.x, 0)), limitLine, 1)

            if (direction) {
                // 1 --> up  /  0 --> down
                if (ints.y < this.y) {
                    // direction up / ints up
                    if (r)
                    {this.self_line(ints,  this.attri["line-style"])}
                    return [this, ints]
                } else {
                    // direction up / ints down
                    let f = this.vertical(length, direction, r, dev, style); 
                    console.warn(`Warning, [Vline] [${this.attri.name}][${this.x},${this.y}]'s vertical line does not intersect with the point[${ints.x}, ${ints.y}] because of opposite direction. Input: Up`)
                    return f
                }
            } else {
                if (ints.y < this.y) {
                    // down / up
                    let f = this.vertical(length, direction, r, dev, style); 
                    console.warn(`Warning, [Vline] [${this.attri.name}][${this.x},${this.y}]'s horizontal line does not intersect with the point[${ints.x}, ${ints.y}] because of opposite direction. Input: Down`)
                    return f
                } else {
                    // down / down
                    if (r)
                    {this.self_line(ints,  this.attri["line-style"])}
                    return [this, ints]
                }
            }

        } else {
            let f = this.vertical(length, direction, r, dev, style); 
            return f
        }
        
    }

    toward_vp(vp, length, direction, r, dev, style)  {
        // direction --> 1 - toward vp  \  0 - away from vp
        // extension from mp of vp to this
        var c = vp.mp.self_const(this)
        // intersection of the extension and measuring line
        var zero = intersection(c, [0, ml.y])

        if (direction) {
            if (this.x > vp.x) {
                var n = new Point(zero[0] - length,  ml.y)
            } else {
                var n = new Point(zero[0] + length, ml.y)
            }
            
        } else {
            if (this.x > vp.x) {
                var n = new Point(zero[0] + length, ml.y)
            } else {
                var n = new Point(zero[0] - length, ml.y)
            }
            
        }

        // and intersect the two line
        var foo = intersection(vp.mp.self_const(n), this.self_const(vp))

        if (dev)
        {this.addOutNode(vp)
        this.render()

        vp.mp.addOutNode(new Point(zero[0], zero[1]))
        vp.mp.addOutNode(n)
        vp.mp.addOutNode(new Point(foo[0], foo[1]))
        vp.mp.render()}

        if (r) {
            this.self_line(new Point(foo[0], foo[1]), style || this.attri["line-style"] || 'white')
            // this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            // this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }

    }
    to(vp, length, direction, r, true_length, dev, limitLine, style) {

        if (true_length) {

            console.info("[to] (true_length) not supported yet. Proceeding with (true_length) = 0")

            if (limitLine) {
                console.info(`[to] ${this.attri.name}[${this.x},${this.y}], (true_length) take priority over limitLine`)
            }
            // return [this, vp]
        }

        if (limitLine) {
            let ints = intersection(this.self_const(vp), limitLine, 1)
            
            // ints.self_line(this, 'orange')

            if (ints.x == Infinity || ints.x == -Infinity) {
                // line do not intersect
                console.info(`Line-1 [${this.self_const(vp)}] does not intersect with Line-2 [${limitLine}]`)
            }

            // this is sign needed to line to intersection
            let to_ints_x = Math.sign(ints.x - this.x)
            let to_ints_y = Math.sign(ints.y - this.y)

            // this is sign needed to line to vp
            if (direction) 
            {
            var to_vp_x = Math.sign(vp.x - this.x)
            var to_vp_y = Math.sign(vp.y - this.y)
        } else {
             // if direction == 0, invert
            var to_vp_x = -1 * Math.sign(vp.x - this.x)
            var to_vp_y = -1 * Math.sign(vp.y - this.y)
        }
        

            // console.info(to_ints_x, to_ints_y);
            // console.info(to_vp_x, to_vp_y);

            // if both signs are same, it is the right direction
            if (to_vp_x == to_ints_x & to_vp_y == to_ints_y) {
                if (r)
                {this.self_line(ints, this.attri["line-style"])}
                return [this, ints]
            } else {
                if (direction) {
                console.info(`[to] ${this.attri.name}[${this.x},${this.y}] The intersection[${Math.round(ints.x)},${Math.round(ints.y)}] lies away from the vanishing point. Input:1 | towards the vanishing point.`)
                } else {
                    console.info(`[to] ${this.attri.name}[${this.x},${this.y}] The intersection[${Math.round(ints.x)},${Math.round(ints.y)}] lies towards the vanishing point. Input:0 | away from the vanishing point.`)
                }
                let f = this.toward_vp(vp, length, direction, r, dev, style)
                return f
            }

        } else {
        let f = this.toward_vp(vp, length,  direction, r, dev, style);
        return f
        
        }
    }

    line(vp, length, direction, r, true_length, limitLine, dev, style) {
        if (typeof(vp) == 'object') {
            
            return this.to(vp, length, direction, r, true_length, dev, limitLine, style)
           
        } else {
            if (vp == 1) {// 1 -- vertical, cause 1 is vertical 
                return this.Vline(length, direction, r, true_length, dev, limitLine, style)
                
            } else if (vp == 0) {
                // horizontal
                return this.Hline(length, direction, r, true_length, dev, limitLine, style)
                
            } else {
                // no idea
                console.info(`line called with unsupported arg, ${vp}`);
            }
        }
    }


    square(x, y, center, style) {
        // x y = [vp, length] vp is Point or 1 or 0
        // 1 --> vertical, 0 --> horizontal

        // everything so compact lol
        

        let x_1 = this.line(x[0], x[1]/2, 1, center, 0,0,0,style)[1]
        let x_2 = this.line(x[0], x[1]/2, 0, center, 0,0,0,style)[1]

        
        if (center) {
            this.line(y[0], y[1]/2, 1, 1, 0,0,0,style)[1]
            this.line(y[0], y[1]/2, 0, 1, 0,0,0,style)[1]
        }
        let li = []
        li.push(x_1.line(y[0], y[1]/2, 1, 1, 0,0,0,style)[1])
        li.push(li[0].self_line(x_2.line(y[0], y[1]/2, 1, 1,0,0,0,style)[1], style)[1])

        li.push(x_1.line(y[0], y[1]/2, 0, 1, 0,0,0,style)[1])
        li.push(li[2].self_line(x_2.line(y[0], y[1]/2, 0, 1,0,0,0,style)[1], style)[1])

        
        if (x[0].angle >= 76 & x[0].angle <= 86) {
            li.push('error')
            
        }

        return li

    }

    box(x, y, height, center, style, squareCenter) {
        // x y = [vp, width]

        // two vp and one height

        this.setAttri('line-style', style || this.attri["line-style"] )

        // at the end of each of these, will be square with two other,
        // example, at the end of //x, it will be square(y, [0, height])
        // x
        this.line(x[0], x[1]/2, 1, center, 0,0,0,style)[1].square(y, [1, height], squareCenter, style) 
        this.line(x[0], x[1]/2, 0, center, 0,0,0,style)[1].square(y, [1, height], squareCenter, style)
        
        // y
        this.line(y[0], y[1]/2, 1, center, 0,0,0,style)[1].square(x, [1, height], squareCenter, style)
        this.line(y[0], y[1]/2, 0, center, 0,0,0,style)[1].square(x, [1, height], squareCenter, style)

        // height
        let h1 = this.line(1, height/2, 1, center, 0,0,0,style)[1]
        let h2 = this.line(1, height/2, 0, center, 0,0,0,style)[1] // dont know why this is all needed for center

        // this is not needed and also dont work
        // h1.square(x, y)
        // h2.square(x, y) 
        return this
    }

    cbox(angle, x, y, height, center, style) {
        // this is for vp with different angle
        // angle = [angle1, angle2]
        // x --> angle1, y --> angle2
        let vp = new VanishingPoint(angle[0], angle[1])
        this.box([vp.left_vp, x], [vp.right_vp, y], height, center, style)
    }

}

class VanishingPoint {
    constructor(angle1, angle2) {
        var slp1 = Math.tan(rad(angle1))
        var slp2 = Math.tan(rad(180-angle2))

        var c1 = stationP.y - slp1  * stationP.x
        var c2 = stationP.y - slp2  * stationP.x

        var v1 = intersection([slp1, c1], [0, 100])
        var v2 = intersection([slp2, c2], [0, 100])

        this.left_vp = new Point(v1[0], v1[1])
        this.left_vp.setAttri('name', `VP-${angle1}`)
        this.left_vp.setAttri('type', 'vp')
        this.left_vp.setAttri('name-visible', 1)
        this.left_vp.angle = angle1

        this.right_vp = new Point(v2[0], v2[1])
        this.right_vp.setAttri('name', `VP-${angle2}`)
        this.right_vp.setAttri('type', 'vp')
        this.right_vp.setAttri('name-visible', 1)
        this.right_vp.angle = angle2

        // measuring points
        this.left_vp.mp = new Point(this.left_vp.x + this.left_vp.self_distance(stationP), this.left_vp.y)
        for (const [key, value] of Object.entries(this.left_vp.attri)) {
            this.left_vp.mp.setAttri(key, value)
        }
        this.left_vp.mp.setAttri('name', `${this.left_vp.attri.name}/MP`)
        this.left_vp.mp.setAttri('type', 'mp')

        this.right_vp.mp = new Point(this.right_vp.x - this.right_vp.self_distance(stationP), this.right_vp.y)
        for (const [key, value] of Object.entries(this.right_vp.attri)) {
            this.right_vp.mp.setAttri(key, value)
        }
        this.right_vp.mp.setAttri('name', `${this.right_vp.attri.name}/MP`)
        this.right_vp.mp.setAttri('type', 'mp')
    }

    setting(showVP, showMP, connectSP) {
        if (showVP)  {
            ctx.beginPath()
            ctx.fillStyle = this.left_vp.attri["name-style"] || 'white'
            ctx.fillText(this.left_vp.attri.name, this.left_vp.x, this.left_vp.y, 100)
            ctx.fillStyle = this.right_vp.attri['name-style'] || 'white'
            ctx.fillText(this.right_vp.attri.name, this.right_vp.x, this.right_vp.y, 100)
            ctx.stroke()
            ctx.closePath()
        }


        if (showMP) {
            this.left_vp.mp.render()
            this.right_vp.mp.render()
        }

        if (connectSP) {
            this.left_vp.addOutNode(stationP)
            this.right_vp.addOutNode(stationP)
            ctx.beginPath()
            ctx.strokeStyle = this.left_vp.attri["line-style"] || 'white'
            ctx.moveTo(this.left_vp.x, this.left_vp.y)
            ctx.lineTo(stationP.x, stationP.y)
            ctx.stroke()
            ctx.strokeStyle = this.right_vp.attri['line-style'] || 'white'
            ctx.moveTo(this.right_vp.x, this.right_vp.y)
            ctx.lineTo(stationP.x, stationP.y)
            ctx.stroke()
            ctx.closePath()
        }

    }
}

class MeasuringLine {
    constructor(y, interval, style) {
        hLine(y, style)
        this.y = y
        this.interval = interval

        ctx.beginPath()
        for (var i = stationP.x; i > 0; i -= this.interval) {
            ctx.moveTo(i,this.y + 5)
            ctx.lineTo(i, this.y - 5)
        }
        for (var j = stationP.x; i < ctx.canvas.width; i += this.interval) {
            ctx.moveTo(i, this.y + 5)
            ctx.lineTo(i, this.y - 5)
        }
        ctx.stroke()
        ctx.closePath()
    }
}

function position(width, wdir, height, hdir, depth, dir)  {
        // wdir --> 1 left, 0 right
        // hdir --> 1 up, 0 down
        // dir --> 1 toward cv, 0 away from cv

        let w = new Point(stationP.x, ml.y).line(0,  width, wdir, 0)
        // w[1].self_line(cv)

        let vp = new VanishingPoint(45, 45)

        // depth
        depth = depth || 0
        dir = dir || 0
        if (wdir) {
            if (dir)
            {var foo = new Point(w[1].x + depth, w[1].y)} else {
                var foo = new Point(w[1].x - depth, w[1].y)
            }
            var ints = intersection(w[1].self_const(cv), vp.left_vp.self_const(foo), 1)
        } else {
            if (dir) 
            {var foo = new Point(w[1].x - depth, w[1].y)} else {
                var foo = new Point(w[1].x + depth, w[1].y)
            }
            var ints = intersection(w[1].self_const(cv), vp.right_vp.self_const(foo), 1)
        }

        // ints.self_line(vp.left_vp)
        // height
        if  (height) {
            var h = w[1].line(1, height || 0, hdir || 0)
            // h[0].self_line(h[1])
            // h[1].self_line(cv)

            var final = ints.line(1, height || 0, hdir || 0, 0, 0, h[1].self_const(cv))
            return final[1]
        } else {
            return ints
        }

    }

vLine(600)

var cv = new Point(600, 100)    // line of vision
cv.htl()

stationP = new Point(600, 500)
stationP.setAttri('name', 'S-P')
stationP.setAttri('line-style', 'gray')
stationP.htl()


var ml = new MeasuringLine(400, 100, 'orange')

let vp = new VanishingPoint(45, 45)
vp.setting(1,0,0)

// cone of vision
ctx.beginPath()
var foo = new VanishingPoint(60, 60).right_vp.x
ctx.arc(cv.x, cv.y, foo.x - cv.x, 0, Math.PI*2)
ctx.stroke()
ctx.closePath()

let a = position(100, 1, 50, 1, 0, 0)
// a.self_line(vp.right_vp)
let b = position(0,0, 150, 1,100, 1)
// b.self_line(vp.right_vp)
let c = position(100, 0, 250, 1, 150, 1)
// c.self_line(vp.right_vp)

// a.cbox([45,45], 200, 200, 200, 0, 'orange')
// b.cbox([45,45], 200, 200, 200, 0, 'orange')

// {var a = new Point(500, 300)
// // a.setAttri('name', 'A-0')
// // a.setAttri('name-visible', 1)

// var a1 = a.toward_vp(vp.right_vp, 200, 1)
// var a2 = a.toward_vp(vp.left_vp, 200, 1)
// // a1.setAttri('name', 'a1')
// // a2.setAttri('name', 'a2')
// // a1.setAttri('name-visible', 1)
// // a2.setAttri('name-visible', 1)

// var a3 = a1.toward_vp(vp.left_vp, 200, 1)
// // a3.setAttri('name', 'a3')
// // a3.setAttri('name-visible', 1)
// a2.toward_vp(vp.right_vp, 200, 1)

// // ---------------------------

// var t = a.vertical(200, 1)
// var t1 = a1.vertical(200, 1)
// var t2 = a2.vertical(200, 1)
// var t3 = a3.vertical(200, 1)

// // ------------------------

// // t.toward_vp(vp.right_vp, 600,  1)
// // t.toward_vp(vp.left_vp,600, 1)
// // t1.toward_vp(vp.left_vp, 600, 1)     // why is it 600
// // t2.toward_vp(vp.right_vp, 600 ,1)

// // ------- same ----------

// t.addOutNode(t1)
// t.addOutNode(t2)
// t1.addOutNode(t3)
// t2.addOutNode(t3)

// // -----------------------

// a.render()
// a1.render()
// a2.render()
// a3.render()

// t.render()
// t1.render()
// t2.render()}
