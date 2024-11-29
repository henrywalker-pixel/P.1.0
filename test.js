
class Test extends Point  {
    constructor(x, y) {
        super(x, y)
    }

    corner(line1, line2, radius, true_length, style) {
        // line = [vp, length, dir, r, style]

        let f1 = this.line(line1[0], line1[1], line1[2], line1[3] || 0, true_length, 0, 0, line1[4] || this.attri["line-style"])[1]
        let f2 = this.line(line2[0], line2[1], line2[2], line2[3] || 0, true_length, 0, 0, line2[4] || this.attri["line-style"])[1]


        ctx.beginPath()
        ctx.strokeStyle = style || this.attri["line-style"]
        ctx.moveTo(f1.x, f1.y)
        ctx.arcTo(this.x, this.y, f2.x, f2.y, radius)
        ctx.stroke()
        ctx.closePath()
    }

}

function f(ts, r) {
    // 76 - 86, does not work at this angle range (76<->86, 90-76<->90-86)
    let obj = {}
    let dist = []

    for (let i = 0; i < 4; i++) {
                obj[ts[i].self_distance(new Point(0,0))] = ts[i]
                dist.push(ts[i].self_distance(new Point(0,0)))
            }

    dist.sort((a,b) => {return a-b})

    let form = []

    for (let i = 0; i < 4; i++) {
        form.push(obj[dist[i]])
    }

    if (r)    {ctx.beginPath()
        ctx.fillStyle = 'orange'
        ctx.moveTo(form[0].x, form[0].y)
        ctx.lineTo(form[1].x, form[1].y)
        ctx.lineTo(form[3].x, form[3].y)
        ctx.lineTo(form[2].x, form[2].y)
        ctx.fill()
        ctx.closePath()}

    return form

}

let point = position(200, 1, 100, 1, 100, 1)
let test = new Test(point.x, point.y)

let ts = test.square([vp.left_vp, 200], [vp.right_vp, 200])

let pest = new Test(ts[0].x, ts[0].y)

pest.corner([ts[1], ts[0].self_distance(ts[1]), 1, 1], [ts[2], ts[0].self_distance(ts[2]), 1, 1], 50, 1)


/* 
four points exists, the distance from (0,0) to each of those in order of lowest to highest 0, 1, 2, 3
connection
0 <--> 1  |  0 <--> 2  |  1 <--> 3 | 2 <--> 3
*/
    

// an = 1 
// let inter = setInterval(() => {
//     ctx.clearRect(0,0,1350,600)
//     let v = new VanishingPoint(an, 90-an)
//     let s = test.square([v.left_vp, 200], [v.right_vp, 200])

//     f(s)
//     // for (let i = 0; i < 4; i++) {
//     //     s[i].self_line(cv)
//     // }

//     console.log(an, 90-an)
//     if (an < 90) {an++} else {an = 1}
// }, 50);




