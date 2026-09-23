---
title: "HDU6143 Killer Names（排列组合）"
date: 2020-06-13 17:48:36
description: "每个人的姓和名都是长度为n的字符串，现在你有m个字符可用，要求姓和名不能出现相同的字符，问最多有多少种方案。"
tags: [HDU, 数学, 动态规划, 字符串]
category: "ACM"
---

# HDU6143 Killer Names（排列组合）

题目链接： [Killer Names](http://acm.hdu.edu.cn/showproblem.php?pid=6143) 

题意：每个人的姓和名都是长度为n的字符串，现在你有m个字符可用，要求姓和名不能出现相同的字符，问最多有多少种方案。

思路：因为不要求m个字符全部用完，所以我们可以考虑共使用x个字符分配给姓和名，可选方案数是C\(m,x\)，显然2<=x<=m。然后我们考虑从x个字符中选 i 个字符给姓，则剩下x\-i个字符可以给名，可选方案数是C\(x,i\)。我们记 A\[n\]\[i\] 是用 i 个字符填n个位置的方法数，可得状态转移方程 a\[n\]\[i\]=\( a\[n\-1\]\[i\-1\] \+ a\[n\-1\]\[i\] \) \* n，初始化a\[n\]\[1\]=1, a\[n\]\[n\]=n\!。

解释一下这个方程的意思：

如果我们用 i 个字符填 n\-1 个位置，则第n个位置可以是 i 个字符中的任意一个。

如果我们用 i\-1个字符填 n\-1个位置，则第n个位置只能是最后的第i个字符，前面就是在 i 个字符中选i\-1个字符，方法数是C\(i,i\-1\)=i。

总的答案数就是 ans=C\(m,x\) \* C\(x,i\) \* a\[n\]\[i\] \* a\[n\]\[x\-i\]。

代码：

```cpp
#include <stdio.h>
#include <string.h>
#include <string>
#include <algorithm>
#include <iostream> 
#include <math.h>
using namespace std;
const int maxn=2005;
const int mod=1e9+7;
long long c[maxn][maxn], a[maxn][maxn];
void init()
{
	for(int i=0;i<maxn;i++) c[i][0]=c[i][i]=1;
	for(int i=2;i<maxn;i++)
	{
		for(int j=1;j<i;j++)
		{
			c[i][j]= (c[i-1][j]+c[i-1][j-1]) % mod;
		}
	}
	for(int i=1;i<maxn;i++) a[i][1]=1;
	for(int i=2;i<maxn;i++) a[i][i] = (a[i-1][i-1] * i) % mod;
	for(int i=3;i<maxn;i++)
	{
		for(int j=2;j<i;j++)
		{
			a[i][j] = ( (a[i-1][j] * j % mod) + (a[i-1][j-1] * j % mod) ) % mod;
		}
	}
}
int main()
{
	init();
	int t;
	scanf("%d",&t);
	while(t--)
	{
		int n,m;
		scanf("%d %d",&n, &m);
		long long ans=0;
		for(int x=2;x<=m;x++)
		{
			int l=max(1,x-n), r=min(x-1, n);
			for(int i=l;i<=r;i++)
			{
				ans += c[m][x] * c[x][i] % mod * a[n][i] % mod * a[n][x-i] % mod;
				ans %= mod;
			}
		}
		printf("%lld\n", ans);
	}
}
```