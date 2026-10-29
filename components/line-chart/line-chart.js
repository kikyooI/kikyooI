// components/line-chart/line-chart.js
Component({
  properties: {
    points: {
      type: Array,
      value: [],
      observer() {
        this.drawChart()
      }
    },
    unit: {
      type: String,
      value: 'kg'
    }
  },

  lifetimes: {
    ready() {
      this.drawChart()
    }
  },

  methods: {
    drawChart() {
      const points = (this.data.points || []).filter(p => p && p.date)
      if (points.length === 0) return

      this.createSelectorQuery().in(this)
        .select('#lineChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) return
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || 2
          const W = res[0].size.width
          const H = res[0].size.height
          canvas.width = W * dpr
          canvas.height = H * dpr
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, W, H)

          const pad = { top: 20, right: 14, bottom: 26, left: 42 }
          const plotW = W - pad.left - pad.right
          const plotH = H - pad.top - pad.bottom

          const weights = points.map(p => Number(p.weight) || 0)
          let min = Math.min(...weights)
          let max = Math.max(...weights)
          if (min === max) {
            min = Math.max(0, min - 1)
            max = max + 1
          }
          const range = max - min
          const yMin = Math.max(0, min - range * 0.15)
          const yMax = max + range * 0.15
          const fmt = (v) => (yMax - yMin) < 5 ? v.toFixed(1) : String(Math.round(v))

          const xOf = (i) => points.length === 1
            ? pad.left + plotW / 2
            : pad.left + (plotW * i) / (points.length - 1)
          const yOf = (w) => pad.top + plotH - ((w - yMin) / (yMax - yMin)) * plotH

          // 横向网格线 + Y轴刻度
          ctx.font = '10px sans-serif'
          const ticks = 4
          for (let i = 0; i <= ticks; i++) {
            const v = yMin + ((yMax - yMin) * i) / ticks
            const y = yOf(v)
            ctx.strokeStyle = '#f0f0f0'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(pad.left, y)
            ctx.lineTo(W - pad.right, y)
            ctx.stroke()
            ctx.fillStyle = '#999'
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillText(fmt(v), pad.left - 6, y)
          }

          // X轴日期标签（点多时抽稀）
          ctx.fillStyle = '#999'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          const step = Math.ceil(points.length / 5)
          points.forEach((p, i) => {
            if (i % step !== 0 && i !== points.length - 1) return
            ctx.fillText(String(p.date).slice(5), xOf(i), H - pad.bottom + 8)
          })

          // 折线
          ctx.strokeStyle = '#4A90D9'
          ctx.lineWidth = 2
          ctx.lineJoin = 'round'
          ctx.beginPath()
          points.forEach((p, i) => {
            const x = xOf(i)
            const y = yOf(Number(p.weight) || 0)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.stroke()

          // 数据点 + 数值标签
          points.forEach((p, i) => {
            const x = xOf(i)
            const y = yOf(Number(p.weight) || 0)
            ctx.fillStyle = '#4A90D9'
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
            if (points.length <= 10) {
              ctx.fillStyle = '#333'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'bottom'
              ctx.fillText(`${p.weight}${this.data.unit}`, x, y - 6)
            }
          })
        })
    }
  }
})
