---
title: "2026: Daydreaming Stockbroker"
date: 2018-07-13 15:17:36
description: "Gina Reed, the famous stockbroker, is having a slow day at work, and between rounds of solitaire she is daydreaming. …"
tags: [CSU]
category: "18暑假集训"
---

# 2026: Daydreaming Stockbroker

##  [2026: Daydreaming Stockbroker](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=2026) 

[](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=2026) [](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=2026) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=2026) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=2026) Time Limit:1 SecMemory Limit:512 MbSubmitted:396Solved:122---

### Description

Gina Reed, the famous stockbroker, is having a slow day at work, and between rounds of solitaire she is daydreaming\. Foretelling the future is hard, but imagine if you could just go back in time and use your knowledge of stock price history in order to maximize your profits\!

Now Gina starts to wonder: if she were to go back in time a few days and bring a measly $100 with her, how much money could she make by just buying and selling stock in Rollercoaster Inc\. \(the most volatile stock in existence\) at the right times? Would she earn enough to retire comfortably in a mansion on Tenerife?

 ![Photo by liz west on flickr](/assets/posts/28_1.jpg)

Note that Gina can not buy fractional shares, she must buy whole shares in Rollercoaster Inc\. The total number of shares in Rollercoaster Inc\. is 100 000, so Gina can not own more than 100 000 shares at any time\. In Gina’s daydream, the world is nice and simple: there are no fees for buying and selling stocks, stock prices change only once per day, and her trading does not influence the valuation of the stock\.


### Input

The first line of input contains an integer *d* \(1 ≤ *d* ≤ 365\), the number of days that Gina goes back in time in her daydream\. Then follow *d* lines, the *i* ’th of which contains an integer *p* <sub> *i* </sub>\(1 ≤ *p* <sub> *i* </sub>≤ 500\)giving the price at which Gina can buy or sell stock in Rollercoaster Inc\. on day *i* \. Days are ordered from oldest to newest\.


### Output

Output the maximum possible amount of money Gina can have on the last day\. Note that the answer may exceed2<sup>32</sup>\.


### Sample Input

```
6
100
200
100
150
125
300
```


### Sample Output

```
650
```



题意：你有初始值100元，告诉了你股票在接下来几天的价格，你可以自己决定买或者卖，求在最后一天结束后你最多能有多少钱。你最多可以拥有100000支股票。

思路：只要今天的股票价格是昨天今天明天三天最低的就买入，是最高的就卖出。并且第一天应该买入，最后一天应该卖出。


```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#define ll long long int
#define INF 0x7fffffff//无穷大，int的最大值，此为16进制
using namespace std;
int main()
{
    int d;
    int a[400], f[400];
    scanf("%d", &d);
    a[0] = INF;//在第一天的时候应该买入股票
    for(int i = 1; i <= d; i++)
    {
        scanf("%d", &a[i]);
        if(a[i] == a[i - 1])//有相同的就不存
        {
            i--;
            d--;
        }
    }
    a[d + 1] = -INF;//最后一天应该将股票全部卖出
    for(int i = 0; i <= d; i++)
    {
        if(a[i + 1] > a[i])
            f[i] = 1;
        else if(a[i + 1] < a[i])
            f[i] = 0;
    }
    ll money = 100;
    int num = 0;
    for (int i = 1; i <= d; i++)
    {
        if (a[i] <= money && f[i] && !f[i - 1])//今天的价格是昨天今天明天三天中最低的，\
		只要拥有的钱比今天股票价格高就应该尽可能多的买入
        {
            ll t = money / a[i];//t为今天能得到的股票数量
            if (t >= 1e5)
				t = 1e5;
            num = t;
            money -= t * a[i];
        }
        else if(f[i] == 0 && f[i - 1])//今天的价格是昨天今天明天三天中最高的，应该全部卖出股票
        {
            money += num * a[i];
            num = 0;
        }
    }
    cout << money << endl;
    return 0;
}
```

我在网上看到一位大佬的超简短代码，和大家分享一下。我自己加了注释，原本是没有注释的，我花了很久才理解这是直接计算利润的。好像显示出来的代码格式有点乱，不要介意。```cpp
#include <stdio.h>
#include <algorithm>
using namespace std;
#define INF 0x3f3f3f3f//无穷大
int main()
{
	int d, prev, cur, i;
	long long money, ceil;
	scanf("%d", &d);
	prev = INF;//prev存储昨天的股票价格，用来和今天进行比较
	money = 100;//初始钱
	ceil = 100000;//最多可拥有的股票支数
	for( i = 0; i < d; i++ )
	{
		scanf("%d", &cur);
		if( cur > prev )
		{
			money += min(money / prev, ceil) * (cur - prev);//cur-prev是昨今两天的股票差值
			//money/prev 是能卖出的股票支数
			//我理解为到了今天再判断昨天是否卖出
			//因为股票最后都是要卖出去的，所以就不直接算股票的买入了，最后反正是变成利润的
		}
		prev = cur;//更新prev
	}
	printf ("%lld\n", money);
	return 0;
}
```