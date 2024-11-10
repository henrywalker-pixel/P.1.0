
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

function intersection(line1, line2, name, style)  { // line1, line2 = [slp, c] return of constants()
    x = (line1[1] - line2[1]) / (line2[0] - line1[0])
    y = line1[0] * x + line1[1]

    if (name) {
        var i = new Point(x, y)
        i.setAttri('name', name)
        i.setAttri('name-style', style || 'orange')
        i.render()
    }

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

    htl() {
        // horizontal line
        hLine(this.y, this.attri["line-style"])
    }

    vtl() {
        // vertical line
        vLine(this.x, this.attri["line-style"])
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

    horizontal(length, direction, r, dev) {
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
            this.addOutNode(new Point(foo[0], foo[1]))
            this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }

    }

    vertical(length, direction, r, dev) {
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
            this.addOutNode(new Point(foo[0], foo[1]))
            this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }
    }

    toward_vp(vp, length, direction, r, dev)  {
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
            this.addOutNode(new Point(foo[0], foo[1]))
            this.render()
            return [this, new Point(foo[0], foo[1])]
        } else {
            this. addOutNode(new Point(foo[0], foo[1]))
            return [this, new Point(foo[0], foo[1])]
        }

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

        this.right_vp = new Point(v2[0], v2[1])
        this.right_vp.setAttri('name', `VP-${angle2}`)
        this.right_vp.setAttri('type', 'vp')
        this.right_vp.setAttri('name-visible', 1)

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

vLine(600)

var cv = new Point(600, 100)    // line of vision
cv.htl()

stationP = new Point(600, 500)
stationP.setAttri('name', 'S-P')
stationP.setAttri('line-style', 'gray')
stationP.htl()

var ml = new MeasuringLine(400, 100, 'orange')

var vp = new VanishingPoint(45, 45)
vp.setting(1,0,1)

// cone of vision
ctx.beginPath()
var foo = new VanishingPoint(60, 60).right_vp.x
ctx.arc(cv.x, cv.y, x - cv.x, 0, Math.PI*2)
ctx.stroke()
ctx.closePath()

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

{
    let a = new Point(500, 300)
    a.setAttri('name', 'A')
    a.setAttri('name-visible', 1)

    var t = a.toward_vp(vp.right_vp,200,1,1,1)
    // t[0].vertical(200,1,1)[1].self_line(t[1].vertical(200,1,1)[1])
    // t[1].vertical(200,1,1)

    t[0].vertical(200,1,1)[1].toward_vp(vp.right_vp,600,1,1,1)


    a.render()
}